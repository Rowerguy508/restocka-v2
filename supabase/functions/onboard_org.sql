CREATE OR REPLACE FUNCTION public.onboard_org_with_template(
    p_org_name TEXT,
    p_locations TEXT[],
    p_template_id UUID,
    p_owner_id UUID
) RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
    v_loc_id UUID;
    v_prod_id UUID;
    v_sup_id UUID;
    v_template_data JSONB;
    v_loc_name TEXT;
    v_prod_item JSONB;
    v_sup_item JSONB;
BEGIN
    -- 1. Fetch Template Data
    SELECT data INTO v_template_data FROM public.onboarding_templates WHERE id = p_template_id;
    IF v_template_data IS NULL THEN
        RAISE EXCEPTION 'Template not found';
    END IF;

    -- 2. Create Organization
    INSERT INTO public.organizations (name, settings)
    VALUES (p_org_name, v_template_data->'settings')
    RETURNING id INTO v_org_id;

    -- 3. Create Membership for Owner
    INSERT INTO public.memberships (organization_id, user_id, role)
    VALUES (v_org_id, p_owner_id, 'OWNER');

    -- 4. Create Suppliers (First, so products can link)
    FOR v_sup_item IN SELECT * FROM jsonb_array_elements(v_template_data->'suppliers') LOOP
        INSERT INTO public.suppliers (organization_id, name, lead_time_hours)
        VALUES (v_org_id, v_sup_item->>'name', (v_sup_item->>'lead_time_hours')::INT)
        RETURNING id INTO v_sup_id;
    END LOOP;

    -- Note: For simplicity in this template, we'll link all products to the first supplier if created, 
    -- or leave NULL. In a real scenario, the template JSON would map them specifically.

    -- 5. Create Locations and their specific data
    FOREACH v_loc_name IN ARRAY p_locations LOOP
        INSERT INTO public.locations (organization_id, name)
        VALUES (v_org_id, v_loc_name)
        RETURNING id INTO v_loc_id;

        -- 6. Create Products (at Org level) and Link to Location
        FOR v_prod_item IN SELECT * FROM jsonb_array_elements(v_template_data->'products') LOOP
            -- Check if product exists for this org (to avoid duplication across locations in same loop)
            SELECT id INTO v_prod_id FROM public.products 
            WHERE organization_id = v_org_id AND name = v_prod_item->>'name';

            IF v_prod_id IS NULL THEN
                INSERT INTO public.products (organization_id, name, unit, category)
                VALUES (v_org_id, v_prod_item->>'name', v_prod_item->>'unit', v_template_data->>'category')
                RETURNING id INTO v_prod_id;
            END IF;

            -- 7. Initialize Stock Level for this Location
            INSERT INTO public.stock_levels (organization_id, location_id, product_id, quantity)
            VALUES (v_org_id, v_loc_id, v_prod_id, (v_prod_item->>'initial_qty')::DECIMAL);

            -- 8. Initialize Reorder Rules for this Location
            INSERT INTO public.reorder_rules (
                organization_id, location_id, product_id, supplier_id,
                safety_days, reorder_qty, automation_mode, active
            )
            VALUES (
                v_org_id, v_loc_id, v_prod_id, v_sup_id, -- Using last created supplier as default
                (v_prod_item->>'safety_days')::INT,
                (v_prod_item->>'reorder_qty')::DECIMAL,
                COALESCE(v_template_data->'settings'->>'automation_default', 'ASSISTED'),
                true
            );
        END LOOP;
    END LOOP;

    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.onboard_org_with_template TO authenticated;
GRANT EXECUTE ON FUNCTION public.onboard_org_with_template TO service_role;
