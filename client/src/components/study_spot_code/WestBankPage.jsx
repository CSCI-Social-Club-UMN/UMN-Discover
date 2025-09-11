import { useState, useMemo } from 'react';
import '../../styles/study_spots_styles/SubPages.css';
import spots from '../../../../data/study_spaces_data/west_bank_spots.json';
import SpotCard from './SpotCard';
import SpotModal from './SpotModal';
import FilterControls from './FilterControls.jsx'

function WestBankPage() {
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [filters, setFilters] = useState({
        noise: '',
        seating: '',
        minSeats: '',
        sortBy: 'name',
        features: {
            outlets: false,
            naturalLight: false,
            coffeeShop: false,
            groupStudy: false,
            whiteboards: false,
            printing: false
        }
    });

    function handleSpotClick(spot) {
        setSelectedSpot(spot);
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setSelectedSpot(null);
    }

    function handleFilterChange(filterType, value) {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    }

    function clearFilters() {
        setFilters({
            noise: '',
            seating: '',
            minSeats: '',
            sortBy: 'name',
            features: {
                outlets: false,
                naturalLight: false,
                coffeeShop: false,
                groupStudy: false,
                whiteboards: false,
                printing: false
            }
        });
    }

    const filteredAndSortedSpots = useMemo(() => {
        let filtered = spots.filter(spot => {
            const attrs = spot.attributes;
            
            if (filters.noise && attrs.Noise !== filters.noise) return false;
            
            if (filters.seating) {
                const seating = attrs.Seating?.toLowerCase() || '';
                if (filters.seating === 'tables' && !seating.includes('tables')) return false;
                if (filters.seating === 'lounge' && !seating.includes('lounge')) return false;
                if (filters.seating === 'individual' && !seating.includes('individual')) return false;
            }
            
            if (filters.minSeats) {
                const seatCount = parseInt(attrs.NUMBER_OF_SEATS_TXT) || 0;
                if (seatCount < parseInt(filters.minSeats)) return false;
            }
            
            //Feature filters
            if (filters.features.outlets && attrs.OUTLETS_YN !== 'Y') return false;  //Outlets
            if (filters.features.naturalLight && attrs.NATURALLIGHT_YN !== 'Y') return false; //Natural Lighting
            if (filters.features.coffeeShop && attrs.COFFEESHOP_YN !== 'Y') return false; //Coffee Shop
            if (filters.features.groupStudy && attrs.GROUPSTUDY_YN !== 'Y') return false; //Group Study
            if (filters.features.whiteboards && attrs.WHITEBOARDS_YN !== 'Y') return false; //Whiteboards
            if (filters.features.printing && attrs.PRINTING_YN !== 'Y') return false; //Printing
            
            return true;
        });

        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'seats-high':
                    return (parseInt(b.attributes.NUMBER_OF_SEATS_TXT) || 0) - (parseInt(a.attributes.NUMBER_OF_SEATS_TXT) || 0);
                case 'seats-low':
                    return (parseInt(a.attributes.NUMBER_OF_SEATS_TXT) || 0) - (parseInt(b.attributes.NUMBER_OF_SEATS_TXT) || 0);
                case 'noise':
                    const noiseOrder = { 'Quiet': 0, 'Low Hum': 1, 'Chatter': 2 };
                    return (noiseOrder[a.attributes.Noise] || 3) - (noiseOrder[b.attributes.Noise] || 3);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        return filtered;
    }, [filters]);

    return (
        <div className="page-container">
            <h1>West Bank Study Spots</h1>
            
            <FilterControls 
                filters={filters} 
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
            />
            
            <div className="results-info">
                Showing {filteredAndSortedSpots.length} of {spots.length} study spots
            </div>
            
            <div className="spots">
                {filteredAndSortedSpots.map((spot, index) => (
                    <SpotCard 
                        key={index} 
                        spot={spot} 
                        onClick={handleSpotClick}
                    />
                ))}
            </div>
            
            {filteredAndSortedSpots.length === 0 && (
                <div className="no-results">
                    No study spots match your current filters. Try adjusting your criteria.
                </div>
            )}

            <SpotModal 
                spot={selectedSpot}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    );
}

export default WestBankPage;