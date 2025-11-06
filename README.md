# 🎬 Cynara - Personal Movie Streaming Platform

A modern, Netflix-inspired personal movie streaming web application built with Django. Cynara transforms your local movie collection into a professional streaming service with a beautiful, responsive interface.

## ✨ Features

**🎭 Core Functionality**
- **Movie Library Management**: Automatic movie import from local directories with metadata extraction
- **Professional Video Player**: Custom HTML5 player with seek, volume, fullscreen, and keyboard shortcuts
- **Smart Search**: Multi-field search across titles, directors, cast, and descriptions
- **User Authentication**: Complete registration, login, and user management system

**🎨 User Experience**
- **Netflix-Style Interface**: Clean, modern design with hover effects and smooth animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Custom Color Palette**: Professional green theme (#1C7C54, #73E2A7, #DEF4C6)
- **Movie Collections**: Organize and browse movies by genre, year, and custom collections

**⚡ Advanced Features**
- **Video Streaming**: Range-request support for efficient streaming and seeking
- **User Profiles**: Favorites, watch later, viewing history, and ratings
- **Admin Panel**: Django admin integration for easy content management
- **Automatic Posters**: Generates placeholder movie posters when none exist
- **Progress Tracking**: Resume watching from where you left off

## 🛠️ Technology Stack

- **Backend**: Django 5.2.5, Python 3.13, PostgreSQL/SQLite
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Video**: Custom HTML5 player with range request support
- **Styling**: CSS Grid, Flexbox, custom CSS variables
- **Image Processing**: Pillow for poster generation
- **Deployment**: Gunicorn, WhiteNoise, Render

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Unity-oss/Cynara.git
   cd Cynara
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Navigate to Django project**
   ```bash
   cd Flicks
   ```

5. **Setup database**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Import movies (optional)**
   ```bash
   python manage.py import_movies /path/to/your/movies
   python manage.py fetch_posters
   ```

8. **Run development server**
   ```bash
   python manage.py runserver
   ```

Visit `http://127.0.0.1:8000` to access Cynara!

## 🌐 Deploy to Render

### One-Click Deployment
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Unity-oss/Cynara)

### Manual Deployment

1. **Fork this repository** to your GitHub account

2. **Create a new Web Service on Render**
   - Connect your GitHub account
   - Select your forked Cynara repository
   - Use these settings:
     - **Environment**: `Python`
     - **Build Command**: `./build.sh`
     - **Start Command**: `cd Flicks && gunicorn Flicks.wsgi:application`
     - **Python Version**: `3.11.0`

3. **Add Environment Variables**
   - `DEBUG`: `False`
   - `SECRET_KEY`: Generate a secure secret key
   - `ALLOWED_HOSTS`: `your-app-name.onrender.com`
   - `DATABASE_URL`: (Render will auto-generate for PostgreSQL)

4. **Deploy**: Click "Create Web Service"

Your Cynara platform will be live at `https://your-app-name.onrender.com`!

## 📱 Usage

### For Movie Enthusiasts
- **Browse Library**: Explore your movie collection with beautiful movie cards
- **Search & Filter**: Find movies by title, director, actor, or genre
- **Personal Lists**: Create favorites and watch later lists
- **Resume Watching**: Pick up where you left off

### For Administrators
- **Admin Panel**: Access `/admin/` for content management
- **Movie Import**: Use management commands to bulk import movies
- **User Management**: Handle user accounts and permissions

## 🎮 Features in Detail

### Video Player
- **Custom Controls**: Professional playback interface
- **Keyboard Shortcuts**: Spacebar (play/pause), arrows (seek), etc.
- **Progress Tracking**: Automatic resume functionality
- **Fullscreen Mode**: Cinematic viewing experience

### Movie Management  
- **Automatic Import**: Scans directories for movie files
- **Metadata Extraction**: Gets titles, years, and file information
- **Poster Generation**: Creates placeholder posters automatically
- **Search Integration**: Full-text search across all metadata

### User Experience
- **Responsive Design**: Works on all devices
- **Fast Loading**: Optimized for quick browsing
- **Intuitive Navigation**: Easy-to-use interface
- **Modern Aesthetics**: Netflix-inspired design

## 🔧 Configuration

### Environment Variables
```env
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://... (for production)
```

### Movie Import
```bash
# Import from local directory
python manage.py import_movies /path/to/movies

# Generate missing posters
python manage.py fetch_posters
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Perfect For

- **Personal Media Servers**: Create your own Netflix at home
- **Family Movie Nights**: Organized, beautiful movie browsing
- **Media Enthusiasts**: Professional-grade streaming experience
- **Learning Django**: Great example of a complete web application

---

**Transform your movie collection into a professional streaming experience with Cynara!** 🍿✨