# Frontend Development Rules

## STRICT RULES:
- **NEVER use inline styles in HTML**.
  - **Explanation**: Semua styling harus ditulis di dalam file CSS atau SCSS. Inline styles mengurangi pemisahan concerns dan mengganggu pemeliharaan kode.
- **ALWAYS use semantic HTML**.
  - **Explanation**: Gunakan elemen HTML yang sesuai dengan makna semantiknya (misalnya, `<header>`, `<footer>`, `<article>`, dll.) untuk meningkatkan aksesibilitas dan SEO.
- **NEVER use `!important` in CSS unless absolutely necessary**.
  - **Explanation**: Penggunaan `!important` dapat mempersulit pemeliharaan dan pemahaman kode CSS, serta bisa menyebabkan gaya yang tidak konsisten.
- **ALWAYS ensure responsiveness**.
  - **Explanation**: Semua tampilan aplikasi harus responsif, artinya bisa menyesuaikan dengan berbagai ukuran layar perangkat (mobile, tablet, desktop) dengan menggunakan teknik seperti media queries, grid, dan flexbox.
- **ALWAYS prefer CSS Grid and Flexbox for layouts**.
  - **Explanation**: CSS Grid dan Flexbox memberikan kontrol yang lebih baik untuk membuat layout yang fleksibel dan responsif dibandingkan dengan metode lama seperti float atau table.
- **NEVER use JavaScript to manipulate layout unless absolutely required**.
  - **Explanation**: Layout dan styling harus diatur menggunakan CSS. JavaScript hanya digunakan untuk interaktivitas dan logika, bukan untuk layout.
- **ALWAYS ensure a11y (accessibility)**.
  - **Explanation**: Setiap elemen interaktif harus dapat diakses oleh pengguna dengan disabilitas, seperti penggunaan `aria-*` attributes dan memastikan semua konten dapat diakses dengan keyboard.
  
## ADDITIONAL GUIDELINES:
- **Use BEM (Block Element Modifier) Naming Convention** for class names.
  - **Explanation**: Penggunaan konvensi penamaan BEM membuat kode CSS lebih mudah dipahami, dipelihara, dan skalabel.
- **Ensure that images have alt text**.
  - **Explanation**: Untuk meningkatkan aksesibilitas dan SEO, semua gambar harus memiliki atribut `alt` yang deskriptif.
- **Optimize images and assets**.
  - **Explanation**: Semua gambar dan aset (seperti font atau ikon) harus dioptimalkan agar ukuran file tidak terlalu besar, yang dapat mempengaruhi waktu muat halaman.
- **Avoid using JavaScript libraries unless necessary**.
  - **Explanation**: Gunakan pustaka atau framework JavaScript hanya jika benar-benar diperlukan untuk menyederhanakan kode. Jika tidak, preferensikan vanilla JavaScript untuk mengurangi ketergantungan dan meningkatkan kinerja.
- **Use version control for all frontend code**.
  - **Explanation**: Selalu gunakan sistem kontrol versi (seperti Git) untuk setiap perubahan pada kode frontend.
- **Follow a consistent code style**.
  - **Explanation**: Gunakan alat seperti Prettier atau ESLint untuk memastikan bahwa semua kode frontend memiliki gaya penulisan yang konsisten.
- **Unit and integration tests**.
  - **Explanation**: Pastikan komponen dan fungsionalitas aplikasi diuji dengan unit tests dan integrasi menggunakan framework seperti Jest atau Testing Library.
  
## PERFORMANCE CONSIDERATIONS:
- **Minimize the use of global styles**.
  - **Explanation**: Gaya global bisa menyebabkan konflik dan sulit dikelola. Fokus pada styling berbasis komponen.
- **Defer loading of non-critical resources**.
  - **Explanation**: Gunakan teknik seperti lazy loading atau defer untuk memuat sumber daya yang tidak diperlukan pada halaman pertama (misalnya, gambar atau skrip JavaScript).
- **Implement code splitting**.
  - **Explanation**: Pisahkan kode aplikasi menjadi bagian-bagian yang lebih kecil untuk memuat hanya yang diperlukan pada setiap halaman atau rute.

## USER EXPERIENCE GUIDELINES:
- **ALWAYS ensure fast load times**.
  - **Explanation**: Pastikan waktu muat halaman tetap cepat dengan cara mengoptimalkan gambar, menggunakan caching, dan meminimalkan permintaan HTTP.
- **Use meaningful loading indicators**.
  - **Explanation**: Jika data sedang dimuat, berikan pengguna indikator yang jelas (misalnya, spinner atau progress bar) untuk memberikan feedback.
- **Ensure smooth transitions and animations**.
  - **Explanation**: Gunakan animasi dan transisi dengan bijak untuk meningkatkan pengalaman pengguna tanpa mengganggu kinerja aplikasi.
- **Test on multiple browsers and devices**.
  - **Explanation**: Selalu lakukan pengujian pada berbagai browser dan perangkat untuk memastikan aplikasi bekerja dengan baik di seluruh platform.

---

Dengan mengikuti aturan-aturan ini, kita akan menjaga kualitas dan keberlanjutan pengembangan aplikasi frontend, serta meningkatkan pengalaman pengguna dan menjaga aplikasi tetap dapat dipelihara dengan mudah.