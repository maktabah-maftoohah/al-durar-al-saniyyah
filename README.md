# Al-Durar al-Saniyyah fi al-Ajwibah al-Najdiyyah (الدرر السنية في الأجوبة النجدية)

> Part of the **[Maktabah Maftoohah (المكتبة المفتوحة)](https://maktabah-maftoohah.github.io/)** Open Islamic Heritage Library.

An open, zero-build, offline-first digital reader for the monumental 16-volume compendium of treatises, legal verdicts (*fatwas*), letters, and answers by the scholars and imams of the Najdi da'wah from the 12th to the 14th century Hijri, compiled and edited by **Shaykh 'Abd al-Rahman ibn Muhammad ibn Qasim al-Najdi al-Hanbali** (1312–1392 AH / 1894–1972 CE).

---

## 📚 16-Volume Structure Overview

* **Volumes 1–3**: *Kitab al-'Aqa'id* (كتاب العقائد) — Fundamentals of Tawhid, Iman, Kufr, Nullifiers of Islam, Names and Attributes, and refutation of theological innovations.
* **Volumes 4–10**: *Kitab al-Fiqh* (كتاب الفقه) — Comprehensive Hanbali jurisprudence and rulings from Taharah (purification) to Hudud and Judiciary.
* **Volumes 11–13**: *Kitab al-Makatib wa al-Rasa'il* (كتاب المكاتيب والرسائل) — Letters, treatises, and diplomatic correspondence with scholars, rulers, and tribes.
* **Volumes 14–15**: *Kitab al-Munasahat wa al-Waza'if* (كتاب المناصحات والوظائف) — Sincere counsels, sermons, devotional works, and didactical poetry.
* **Volume 16**: *Al-Faharis al-'Ammah wa al-Tarajim* (الفهارس العامة والتراجم) — Comprehensive indices of verses, hadiths, athar, and biographies of scholars.

---

## ⚡ Architectural Features

* **Zero-Build Vanilla ES6**: Runs natively in any evergreen web browser with zero compilation or external bundlers.
* **Offline First & PWA**: Complete service worker (`sw.js`) and manifest caching core application assets.
* **Dual-Language & Typography**: Standard Malaysian Islamic nomenclature (Bahasa Melayu), full English translation, and verified Arabic typography via *Amiri* and *Scheherazade New*.
* **Universal Search Engine Indexing**: Complete Schema.org Book JSON-LD structured data and Sitemaps.org 0.9 XML index.

---

## 🛠️ Development & Local Testing

```bash
# Start local development server
python scripts/serve.py --port 8000

# Run project structure and data integrity verification
python scripts/verify_project.py
python scripts/verify_data_integrity.py
```
