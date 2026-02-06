import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Location } from '@/types/database';

interface LocationContextType {
    locations: Location[];
    activeLocation: Location | null;
    switchLocation: (locationId: string) => void;
    loading: boolean;
    refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const { membership } = useAuth();
    const [locations, setLocations] = useState<Location[]>([]);
    const [activeLocation, setActiveLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (membership?.organization_id) {
            refreshLocations();
        } else {
            setLocations([]);
            setActiveLocation(null);
            setLoading(false);
        }
    }, [membership]);

    const refreshLocations = async () => {
        console.log('[LocationContext] Refreshing locations...');
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .eq('organization_id', membership!.organization_id)
                .order('created_at');

            console.log('[LocationContext] Fetch Result:', { data, error });

            if (error) throw error;

            const locs = data as Location[] || [];
            setLocations(locs);

            // Restore active location or default to first
            const stored = localStorage.getItem('restocka_active_location');
            const found = locs.find(l => l.id === stored);

            if (found) {
                setActiveLocation(found);
            } else if (locs.length > 0) {
                setActiveLocation(locs[0]);
                localStorage.setItem('restocka_active_location', locs[0].id);
            }
        } catch (err) {
            console.error('Error fetching locations:', err);
        } finally {
            setLoading(false);
        }
    };

    const switchLocation = (locationId: string) => {
        const loc = locations.find(l => l.id === locationId);
        if (loc) {
            setActiveLocation(loc);
            localStorage.setItem('restocka_active_location', loc.id);
            window.location.reload(); // Simple way to ensure all queries re-run with new location
        }
    };

    return (
        <LocationContext.Provider value={{ locations, activeLocation, switchLocation, loading, refreshLocations }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocationContext() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocationContext must be used within a LocationProvider');
    }
    return context;
}
