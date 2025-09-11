import '../../styles/study_spots_styles/FilterControls.css';

function FilterControls({ filters, onFilterChange, onClearFilters }) {
    return (
        <div className="filter-controls">
            <h3>Filter Study Spots</h3>
            
            <div className="filter-grid">
                {/* Noise Level Filter */}
                <div className="filter-group">
                    <label>Noise Level:</label>
                    <select 
                        value={filters.noise} 
                        onChange={(e) => onFilterChange('noise', e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="Quiet">Quiet</option>
                        <option value="Low Hum">Low Hum</option>
                        <option value="Chatter">Chatter</option>
                    </select>
                </div>

                {/* Seating Type Filter */}
                <div className="filter-group">
                    <label>Seating Type:</label>
                    <select 
                        value={filters.seating} 
                        onChange={(e) => onFilterChange('seating', e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="tables">Tables and Chairs</option>
                        <option value="lounge">Lounge Seating</option>
                        <option value="individual">Individual Desks</option>
                    </select>
                </div>

                {/* Minimum Seats Filter */}
                <div className="filter-group">
                    <label>Min Seats:</label>
                    <input 
                        type="number" 
                        value={filters.minSeats} 
                        onChange={(e) => onFilterChange('minSeats', e.target.value)}
                        placeholder="0"
                        min="0"
                    />
                </div>

                {/* Sort By */}
                <div className="filter-group">
                    <label>Sort By:</label>
                    <select 
                        value={filters.sortBy} 
                        onChange={(e) => onFilterChange('sortBy', e.target.value)}
                    >
                        <option value="name">Name</option>
                        <option value="seats-high">Seats (High to Low)</option>
                        <option value="seats-low">Seats (Low to High)</option>
                        <option value="noise">Noise Level</option>
                    </select>
                </div>
            </div>

            {/* Feature checkboxes */}
            <div className="feature-filters">
                <label className="feature-section-label">Required Features:</label>
                <div className="checkbox-grid">
                    {[
                        { key: 'outlets', label: 'Outlets' },
                        { key: 'naturalLight', label: 'Natural Light' },
                        { key: 'coffeeShop', label: 'Coffee Shop' },
                        { key: 'groupStudy', label: 'Group Study' },
                        { key: 'whiteboards', label: 'Whiteboards' },
                        { key: 'printing', label: 'Printing' }
                    ].map(feature => (
                        <label key={feature.key} className="checkbox-label">
                            <input 
                                type="checkbox" 
                                checked={filters.features[feature.key]} 
                                onChange={(e) => onFilterChange('features', { 
                                    ...filters.features, 
                                    [feature.key]: e.target.checked 
                                })}
                            />
                            {feature.label}
                        </label>
                    ))}
                </div>
            </div>

            <button className="clear-filters-btn" onClick={onClearFilters}>
                Clear All Filters
            </button>
        </div>
    )
}

export default FilterControls;