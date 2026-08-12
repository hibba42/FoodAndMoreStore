

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer style={{textAlign: "center"}}>
            Food and More Store, {year}.
        </footer>
    );    
}