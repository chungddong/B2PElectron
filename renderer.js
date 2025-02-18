window.addEventListener('DOMContentLoaded', async () => {
    try {
        // assets 폴더에 있는 bible-books.json 파일 가져오기
        const response = await fetch('assets/bible-books.json');
        const bibleBooks = await response.json();

        // 첫 번째 select 요소 가져오기
        const selectElement = document.getElementById('bible-select');

        // JSON 데이터를 기반으로 option 요소 추가
        bibleBooks.forEach(book => {
            const option = document.createElement('option');
            option.value = book.value;
            option.textContent = book.name;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('JSON 데이터를 불러오는 중 오류 발생:', error);
    }
});
