import logoHead from '../assets/images/logo-head.png';

function Logo() {
    return (
        <div className="logo-container">
            <img src={logoHead} alt="Algérie Poste" className="logo-image" />
        </div>
    );
}

export default Logo; 