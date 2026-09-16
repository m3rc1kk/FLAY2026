import { Outlet } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Hero from "../../components/Hero/Hero.jsx";
import About from "../../components/About/About.jsx";
import Winners from "../../components/Winners/Winners.jsx";
import Nominations from "../../components/Nominations/Nominations.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Intro from "../../components/Intro/Intro.jsx";
import CursorGlow from "../../components/CursorGlow/CursorGlow.jsx";
import Marquee from "../../components/Marquee/Marquee.jsx";


export default function Main() {
    return (
        <>
            <Intro />
            <Header />
            <Hero />
            <About />
            <Winners />
            <Nominations />
            <Marquee />
            <Footer />
            <Outlet />
            <CursorGlow />
        </>
    );
}