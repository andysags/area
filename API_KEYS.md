# AREA Services - API Keys Reference

This document lists all services in the AREA automation system and their required API key environment variables.

## RapidAPI Key

All services use the same RapidAPI key:
```
517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
```

## Services List

### Original Services (7)

| Service | Slug | Environment Variable | Description |
|---------|------|---------------------|-------------|
| AliExpress | `aliexpress` | `ALIEXPRESS_RAPIDAPI_KEY` | Product search and details |
| Anime DB | `anime` | `ANIME_RAPIDAPI_KEY` | Anime information |
| Image Gen | `image_gen` | `IMAGE_GEN_RAPIDAPI_KEY` | AI image generation (Flux) |
| Netflix | `netflix` | `NETFLIX_RAPIDAPI_KEY` | Netflix content information |
| Sport | `sport` | `SPORT_RAPIDAPI_KEY` | Sports data and scores |
| Translate AI | `translate` | `TRANSLATE_RAPIDAPI_KEY` | Text and JSON translation |
| YouTube MP3 | `youtube` | `YOUTUBE_RAPIDAPI_KEY` | YouTube to MP3 conversion |

### New Services - Batch 1 (3)

| Service | Slug | Environment Variable | Description |
|---------|------|---------------------|-------------|
| Instagram | `instagram` | `INSTAGRAM_RAPIDAPI_KEY` | User posts retrieval |
| Yahoo Finance | `yahoo_finance` | `YAHOO_FINANCE_RAPIDAPI_KEY` | Stock market news |
| Spotify Downloader | `spotify` | `SPOTIFY_RAPIDAPI_KEY` | Song download from Spotify |

### New Services - Batch 2 (3)

| Service | Slug | Environment Variable | Description |
|---------|------|---------------------|-------------|
| Games Details | `games` | `GAMES_RAPIDAPI_KEY` | Game news and announcements |
| Horoscopes AI | `horoscope` | `HOROSCOPE_RAPIDAPI_KEY` | Daily horoscopes |
| Books API | `books` | `BOOKS_RAPIDAPI_KEY` | Book listings |

### New Services - Batch 3 (3)

| Service | Slug | Environment Variable | Description |
|---------|------|---------------------|-------------|
| Contact Crawler | `contact_crawler` | `CONTACT_CRAWLER_RAPIDAPI_KEY` | Website contact scraping |
| Vehicle Database | `vehicle` | `VEHICLE_RAPIDAPI_KEY` | License plate detection |
| PDF Converter | `pdf_converter` | `PDF_CONVERTER_RAPIDAPI_KEY` | PDF to text conversion |

### New Services - Batch 4 (2)

| Service | Slug | Environment Variable | Description |
|---------|------|---------------------|-------------|
| AI Detection | `ai_detection` | `AI_DETECTION_RAPIDAPI_KEY` | AI-generated text detection |
| Job Search | `job_search` | `JOB_SEARCH_RAPIDAPI_KEY` | Job listings and details |

## Total: 18 Services

## Environment Setup

To set all environment variables at once:

```bash
export ALIEXPRESS_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export ANIME_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export IMAGE_GEN_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export NETFLIX_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export SPORT_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export TRANSLATE_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export YOUTUBE_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export INSTAGRAM_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export YAHOO_FINANCE_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export SPOTIFY_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export GAMES_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export HOROSCOPE_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export BOOKS_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export CONTACT_CRAWLER_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export VEHICLE_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export PDF_CONVERTER_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export AI_DETECTION_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
export JOB_SEARCH_RAPIDAPI_KEY=517e0af406msh86f7f80a191d928p1d4672jsn9be760fc3979
```

## Service Registration

To register all services in the database:

```bash
cd /Users/aureldsk/projects3/G-DEV-500-COT-5-2-area-1/server

# Original services
python3 register_aliexpress.py
python3 register_anime.py
python3 register_image_gen.py
python3 register_netflix.py
python3 register_sport.py
python3 register_translate.py
python3 register_youtube.py

# New services
python3 register_instagram.py
python3 register_yahoo_finance.py
python3 register_spotify.py
python3 register_games.py
python3 register_horoscope.py
python3 register_books.py
python3 register_contact_crawler.py
python3 register_vehicle.py
python3 register_pdf_converter.py
python3 register_ai_detection.py
python3 register_job_search.py
```

## Security Note

⚠️ **IMPORTANT**: This file contains sensitive API keys. Do not commit this file to public repositories. Add it to `.gitignore` if needed.
