# BME 302 and BNC 501 course site

Course resources for my students at GL Bajaj Institute of Technology & Management, Greater Noida.

**Live site:** https://pandeyabhisheks.github.io/COURSE_RESOURCES/

This is a static site published with GitHub Pages from the `COURSES_MAIN` branch (Settings > Pages, folder `/ (root)`). No build step is needed: edit a file, commit, and the site updates within a couple of minutes.

## What is in this repository

| File | Purpose |
|---|---|
| `index.html` | Home page: course cards, announcements, common questions, ask-a-question form, short bio |
| `bme302.html` | BME 302 Fluid Mechanics and Fluid Machines: notes, question bank, simulator link, syllabus |
| `bnc501.html` | BNC 501 Constitution of India, Law and Engineering: unit slides and syllabus |
| `bio.html` | Full bio, email and Google Scholar link |
| `viewer.html` | View-only PDF reader. Asks for name, roll number and email, watermarks pages and logs the open |
| `hydraulic-machines-simulator.html` | Interactive turbines and pumps simulator |
| `style.css`, `site.js` | Shared styling and site scripts (visit notice, counter, announcements, questions) |
| `config.js` | Holds the Google Apps Script web app link that connects the site to the Google Sheet |
| `Code.gs` | Copy of the Apps Script code that runs inside the Google Sheet |
| `SETUP_STEPS.txt` | Step-by-step setup for the Google Sheet and script |
| `*.pdf` | Lecture notes, slides and solutions opened through `viewer.html` |
| `photo.jpg` | Profile photo |

## Common tasks

**Edit a page.** Open the file, click the pencil icon, make the change and click *Commit changes*.

**Replace a PDF.** Click *Add file > Upload files* and upload a file with exactly the same name. It replaces the old one.

**Add a new PDF.** Upload it, then:
1. add a link on the course page, for example `<li><a href="viewer.html?f=NEW_FILE.pdf">Title</a></li>`, and
2. add the file name to the `OK` list near the bottom of `viewer.html`. The viewer refuses files that are not on this list.

**Post an announcement.** In the Google Sheet "Course site data", add a row to the *Announcements* tab (Date, Title, Message, Show = Yes). It appears on the home page within about 5 minutes. Set Show = No to hide it.

**Answer common questions.** Student questions arrive in the *Questions* tab with Status "New". Copy useful ones into the *FAQ* tab (Question, Answer, Course, Show = Yes) to publish them for everyone. No individual replies are sent.

**See visitor statistics.** Open the *Dashboard* tab of the Google Sheet: total visits, unique visitors, documents opened, and breakdowns by region, country, page, device and file. The home page footer also shows the visit count.

## Google Sheet connection

The counter, document-open log, announcements and questions use a Google Sheet with an Apps Script web app (owned by abhishek.kaundinya.in@gmail.com). The web app link is in `config.js`. To disconnect, set `API: ''` in `config.js`; the site keeps working without these features.

If the script is ever set up again, keep `/** @OnlyCurrentDoc */` as the first line of the code. It limits the script to that one sheet; without it Google may show "This app is blocked".

If the code in Apps Script is changed, publish the change with *Deploy > Manage deployments > Edit > Version: New version > Deploy* so the same link keeps working.

## Privacy

The site records visits (random visitor ID, page, approximate city, region and country, device) only after the visitor clicks OK on the notice. Opening a document records the student's name, roll number and email with the file name, time and approximate location. Keep the Google Sheet private, delete old rows when no longer needed, and follow college rules and the Digital Personal Data Protection Act, 2023.

This repository is public, so every file in it, including the PDFs, can be downloaded directly from GitHub. The viewer's form and watermark apply only to students who open documents through the course pages.
