import '../../styles/study_spots_styles/SpotCard.css';

function SpotCard({ spot, onClick }) {
    return (
        <div className="card" onClick={() => onClick(spot)}>
            <h4>{spot.name}</h4>
            <div className="image-placeholder">
                <p>IMAGE WILL GO HERE</p>
            </div>
            <p className="campus-name">{spot.campus}</p>
        </div>
    );
}

export default SpotCard;