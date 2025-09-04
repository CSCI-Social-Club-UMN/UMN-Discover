import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaUsers, FaCode, FaHeart, FaGithub, FaDiscord, FaMapMarkerAlt, FaCalendarAlt, FaChartBar, FaUserTie, FaCoffee, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const About = () => {
  const features = [
    {
      icon: <FaSearch />,
      title: "Search & Review",
      description: "Find and review clubs, classes, professors, dining halls, and study spots"
    },
    {
      icon: <FaUsers />,
      title: "Student Profiles",
      description: "Create personalized profiles with controlled social media links"
    },
    {
      icon: <FaCalendarAlt />,
      title: "Smart Scheduling",
      description: "Auto generate schedules accounting for commutes and club meetings"
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Campus Navigation",
      description: "Navigate efficiently via tunnel/skyway map directions"
    },
    {
      icon: <FaChartBar />,
      title: "Grade Analytics",
      description: "Historical grade distributions for informed course selection"
    },
    {
      icon: <FaUserTie />,
      title: "Professor Reviews",
      description: "Student ratings and reviews of faculty members"
    }
  ];

  const contributors = [
    // role can be add later ig (e.g. "Frontend Developer", "Backend Developer")
    { name: "Anthony-Krahmer-Git", role: "", githubUser: "Anthony-Krahmer-Git", discord: "https://discordapp.com/users/372375574561292288" },
    { name: "BlueYellow-Green", role: "", githubUser: "BlueYellow-Green", discord: "https://discordapp.com/users/733848884228521994" },
    { name: "CleverDeer", role: "", githubUser: "CleverDeer", discord: "https://discordapp.com/users/446021396254949376" },
    { name: "madebyethan", role: "", githubUser: "madebyethan", discord: "https://discordapp.com/users/1295776866707177534" },
    { name: "MetaZoan1", role: "", githubUser: "MetaZoan1", discord: "https://discordapp.com/users/388807710176444426" },
    { name: "NAMERIO", role: "", githubUser: "NAMERIO", discord: "https://discordapp.com/users/605043565856423955" },
    { name: "tomhomestar", role: "", githubUser: "tomhomestar", discord: "https://discordapp.com/users/1317956337270915113" }
  ];

  const techStack = [
    { 
      name: "React.js", 
      description: "Frontend framework for building user interfaces",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
    },
    { 
      name: "Node.js", 
      description: "Backend runtime environment",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
    },
    { 
      name: "PostgreSQL", 
      description: "Database for storing user and application data",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"
    },
    { 
      name: "Cloudinary", 
      description: "Cloud based image storage and optimization",
      logo: "https://cdn.brandfetch.io/id2vqrnWlC/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1750748982022"
    },
    { 
      name: "Google OAuth", 
      description: "Secure authentication system",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
    },
    { 
      name: "Express.js", 
      description: "Web application framework for Node.js",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg"
    }
  ];

  return (
    <div className="about-page">
      <div className="about-container">
        <motion.div 
          className="about-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="about-icon">
            <FaGraduationCap />
          </div>
          <h1>About UDiscover</h1>
          <p className="about-subtitle">
            A comprehensive platform designed by students, for students at the University of Minnesota
          </p>
        </motion.div>
        <motion.section 
          className="about-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="section-icon">
            <FaHeart />
          </div>
          <h2>Our Mission</h2>
          <div className="section-content">
            <p>
            UDiscover was built to make life at the University of Minnesota a little easier. We noticed that
            important info and helpful tools were scattered all over the place, which made simple things more
            frustrating than they needed to be.
            </p>
            <p>
            Our goal is to put everything students need in one simple, easy to use spot. Whether it’s finding a
            great study space, figuring out the campus tunnels, checking grade trends, or connecting with other
            students, UDiscover brings it all together in one place.
            </p>
          </div>
        </motion.section>
        <motion.section 
          className="about-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="section-icon">
            <FaCode />
          </div>
          <h2>What We Offer</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
              >
                <div className="feature-icon-container">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
        <motion.section 
          className="about-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2>Technology Stack</h2>
          <div className="tech-grid">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                className="tech-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
              >
                <div className="tech-logo">
                  <img src={tech.logo} alt={tech.name} />
                </div>
                <h4>{tech.name}</h4>
                <p>{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
        <motion.section 
          className="contributors-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="section-icon">
            <FaUsers />
          </div>
          <h2>Team</h2>
          <p className="contributors-description">
            Built by students, for students at the University of Minnesota
          </p>
          <div className="contributors-grid">
            {contributors.map((contributor, index) => (
              <motion.div
                key={index}
                className="contributor-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="contributor-avatar"
                  whileHover={{ scale: 1.1 }}
                >
                  <img 
                    src={`https://github.com/${contributor.githubUser}.png`} 
                    alt={contributor.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="avatar-fallback">
                    <FaUsers />
                  </div>
                </motion.div>
                <div className="contributor-info">
                  <h3>{contributor.name}</h3>
                  <p>{contributor.role}</p>
                  <div className="contributor-links">
                    <a 
                      href={`https://github.com/${contributor.githubUser}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link github"
                    >
                      <FaGithub />
                    </a>
                    <a 
                      href={contributor.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link discord"
                    >
                      <FaDiscord />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
        <motion.section 
          className="about-section disclaimer-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2>Student Organization</h2>
          <div className="disclaimer-content">
            <p>
              <strong>UDiscover</strong> is developed and maintained by the <strong>CSCI Social Club</strong>, 
              a registered student organization at the University of Minnesota. This platform is created 
              by students, for students, to enhance the university experience.
            </p>
            <p className="disclaimer-notice">
              <strong>Important:</strong> This platform is independent from and not affiliated with 
              or endorsed by the Regents of the University of Minnesota. The university is not 
              responsible for the content, functionality, or data practices of this student created platform.
            </p>
          </div>
        </motion.section>
        <motion.section 
          className="get-started-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h2>Get Started</h2>
          <p>Ready to explore everything UMN has to offer?</p>
          <div className="get-started-buttons">
            <Link to="/social" className="primary-button">
              <FaUsers /> Join the Community
            </Link>
            <Link to="/map" className="secondary-button">
              <FaMapMarkerAlt /> Explore Campus
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;