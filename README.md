<h1 align="center">UDiscover</h1>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" />
</p>


# **Overview**

The **UDiscover App** is a web tool designed to help student life at the University of Minnesota. The platform brings together essential services and functions in one place, making it easier to manage academics, campus navigation, and involvement.

### Core Features

- Search and review **clubs**, **classes**, **professors**, **dining halls**, and **study spots**
- Create personalized **student profiles** with controlled social media links (UMN email required)
- Auto generate **schedules** that account for commutes, transitions, and club meetings
- Navigate campus efficiently via tunnel/skyway **map directions**
- Access important **student resources** from one dashboard


# **Tech Stack**

### Languages & Tools Used

- **Frontend**: React.js
- **Backend**: Node.js
- **Version Control**: GitHub
- **Core**: HTML, CSS, JavaScript

### Future Plans

- Docker integration for deployment
- DDoS protection setup
- Mobile app development (native or hybrid)

# **Links**

- [Roadmap](./Roadmap.md)
- [Team Assignments & Goals](./Teams.md)
- [GitHub Organization](https://github.com/CSCI-Social-Club-UMN)


# **Timeline**

- **Rough Draft Due**: August 31, 2025
- **Final Clean Version**: October 5, 2025


# **Notes**

- Cite and license any third party code used
- Let us know when you are no longer interseted
- We all are new to this. So don't be afraid to ask for anything.


# **Learning Resources**

- The [Discord](https://discord.gg/XuCXuTsFut) Server
- YouTube Tutorials
- Stack Overflow
- GitHub Docs
- Cheat Sheets & Reference Guides

<h1 align="center">Dev Server Set Up</h1>

## Step 1: Install Node.js and Git
Node: https://nodejs.org/en/download
<br>
Git: https://git-scm.com/downloads

## Step 2: Install npm and pnpm globally in Command Prompt
```npm install -g npm```
<br>
```npm install -g pnpm```

## Step 3: Fork this repo and clone the repo you just forked.
ex:
<br>

```git clone https://github.com/CSCI-Social-Club-UMN/umn-nav```
> **!** replace this link to your forked repo

## Step 4: Navigate into the project folder
```cd umn-nav```

## Step 5: Install all project dependencies using pnpm
The setup script will:
Install dependencies with pnpm install,
Ask whether you want to enable the account system (Google OAuth + Database).
If enabled, it will prompt you for:
Google OAuth credentials,
Database credentials.
Regardless of account system, it will also ask for Cloudinary credentials.
And it create .env files for server and client
<br>
```pnpm project:setup```

## Step 6: Start the development server
```pnpm -r dev```

The development server will start (default is http://localhost:3000)
> (Note: The port may change later depending on setup)

# **Attributions**
Grade and SRT data obtained from [Social Coding @ UMN](https://www.socialcoding.net) via the University of Minnesota [Office of Data Access and Privacy](https://ogc.umn.edu/data-access-and-privacy) and 
the [Office of Undergraduate Education Academic Support Resources.](https://undergrad.umn.edu/units/asr)

<p align="center"><i>Built by students, for students — UMN</i></p>
