import '../../styles/study_spots_styles/SpotModal.css';

function SpotModal({ spot, isOpen, onClose }) {
    if (!isOpen || !spot) return null;

    const attrs = spot.attributes;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                
                <div className="modal-header">
                    <h2>{spot.name}</h2>
                    <p className="modal-campus">{spot.campus}</p>
                </div>

                <div className="modal-image">
                    <div className="image-placeholder">
                        <p>IMAGE WILL GO HERE</p>
                    </div>
                </div>

                <div className="modal-details">
                    <div className="detail-grid">
                        <div className="detail-item">
                            <strong>Seats:</strong> 
                            <span>{attrs.NUMBER_OF_SEATS_TXT}</span>
                        </div>
                        <div className="detail-item">
                            <strong>Noise Level:</strong> 
                            <span>{attrs.Noise}</span>
                        </div>
                        <div className="detail-item">
                            <strong>Seating:</strong> 
                            <span>{attrs.Seating}</span>
                        </div>
                        <div className="detail-item">
                            <strong>Technology:</strong> 
                            <span>{attrs.Technology}</span>
                        </div>
                        <div className="detail-item">
                            <strong>Amenities:</strong> 
                            <span>{attrs.Amenities}</span>
                        </div>
                    </div>
                    
                    <div className="modal-features">
                        <h3>Available Features</h3>
                        <div className="feature-tags">
                            {attrs.OUTLETS_YN === 'Y' && 
                                <span className="tag tag-outlets">Outlets</span>}
                            {attrs.NATURALLIGHT_YN === 'Y' && 
                                <span className="tag tag-light">Natural Light</span>}
                            {attrs.COFFEESHOP_YN === 'Y' && 
                                <span className="tag tag-coffee">Coffee Shop</span>}
                            {attrs.GROUPSTUDY_YN === 'Y' && 
                                <span className="tag tag-group">Group Study</span>}
                            {attrs.WHITEBOARDS_YN === 'Y' && 
                                <span className="tag tag-whiteboard">Whiteboards</span>}
                            {attrs.PRINTING_YN === 'Y' && 
                                <span className="tag tag-printing">Printing</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SpotModal;