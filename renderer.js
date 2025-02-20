window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('assets/bible-books.json');
        if (!response.ok) throw new Error("JSON 파일을 찾을 수 없습니다.");
        
        const bibleBooks = await response.json();
        console.log("불러온 JSON 데이터:", bibleBooks);

        const selectElement = document.getElementById('bible-select');
        if (!selectElement) {
            console.error("선택 박스를 찾을 수 없습니다.");
            return;
        }

        // 구약과 신약 리스트를 합쳐서 select에 추가
        bibleBooks.구약.concat(bibleBooks.신약).forEach(book => {
            const option = document.createElement('option');
            option.value = book.value;
            option.textContent = book.name;
            selectElement.appendChild(option);
        });

        console.log("성경 목록이 추가되었습니다.");

        // 초기 선택값을 "창세기" 1장으로 설정
        selectElement.value = "1-01창세기"; // "창세기"의 JSON 파일 내 key 값과 맞춰야 함
        selectElement.dispatchEvent(new Event("change")); // 자동으로 이벤트 트리거

    } catch (error) {
        console.error('JSON 데이터를 불러오는 중 오류 발생:', error);
    }
});


// 성경 권 선택 시
document.getElementById("bible-select").addEventListener("change", function () {
    const selectedBook = this.value;
    console.log("선택한 성경:", selectedBook);
    loadBible(selectedBook);

    setTimeout(() => {
        const chapterSelect = document.getElementById("chapter-select");
        if (chapterSelect) {
            chapterSelect.value = "1";
            chapterSelect.dispatchEvent(new Event("change"));
        }
    }, 100);
});

// 장 번호 선택 시
document.getElementById("chapter-select").addEventListener("change", function () {
    const selectedChapter = this.value;
    console.log("선택한 장 번호:", selectedChapter);
    loadVerses(selectedChapter);

    setTimeout(() => {
        const verseSelect = document.getElementById("verse-select");
        if (verseSelect) {
            verseSelect.value = "1";
            verseSelect.dispatchEvent(new Event("change"));
        }
    }, 100);
});

//절 선택 시 해당 절로 자동 스크롤
document.getElementById("verse-select").addEventListener("change", function () {
    const selectedVerse = this.value;
    const previewElement = document.querySelector(".Preview");

    const verseElement = Array.from(previewElement.children).find(el => 
        el.textContent.includes(`${selectedVerse}절:`)
    );

    if (verseElement) {
        verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
});


// 성경 파일 로드
async function loadBible(bookValue) {
    const filePath = `assets/Bibles/${bookValue}.txt`;

    console.log("선택 파일 경로 : " + filePath);

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error("파일을 찾을 수 없습니다.");

        const arrayBuffer = await response.arrayBuffer(); // 파일 내용을 ArrayBuffer로 변환
        const decoder = new TextDecoder("euc-kr"); // EUC-KR 디코더 생성
        const text = decoder.decode(arrayBuffer); // ArrayBuffer를 텍스트로 디코드

        // 장 번호 추출: "창1:", "출3:", "마5:" 형태에서 장 번호 추출
        const chapters = new Set();
        const lines = text.split("\n");
        lines.forEach(line => {
            const match = line.match(/^([^\d]*)(\d+):/); // 예: 창1:1, 출3:2
            if (match) {
                const chapterNumber = parseInt(match[2], 10); // 장 번호 추출
                chapters.add(chapterNumber);
            }
        });

        const totalChapters = Math.max(...[...chapters]);
        console.log("총 장 수:", totalChapters); // 몇 장까지 있는지 출력

        // 두 번째 select 요소 가져오기
        const chapterSelectElement = document.getElementById('chapter-select');
        if (!chapterSelectElement) {
            console.error("장 번호 선택 박스를 찾을 수 없습니다.");
            return;
        }

        // 장 번호 옵션 추가
        chapterSelectElement.innerHTML = ''; // 기존 옵션 지우기
        for (let i = 1; i <= totalChapters; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}장`;
            chapterSelectElement.appendChild(option);
        }

        console.log("장 번호 목록이 추가되었습니다.");

    } catch (error) {
        console.error(error);
        document.querySelector(".Preview").innerText = "파일을 불러오는 데 실패했습니다.";
    }
}


// 선택된 장의 절들을 모두 출력
async function loadVerses(selectedChapter) {
    const bookValue = document.getElementById('bible-select').value;
    const filePath = `assets/Bibles/${bookValue}.txt`;

    console.log("선택 파일 경로 : " + filePath);

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error("파일을 찾을 수 없습니다.");

        const arrayBuffer = await response.arrayBuffer();
        const decoder = new TextDecoder("euc-kr");
        const text = decoder.decode(arrayBuffer);

        const lines = text.split("\n");
        const bookAbbreviation = lines[0].split(":")[0].replace(/\d/g, ''); // 숫자 제외한 책 이름 추출

        console.log("권이름 : " + bookAbbreviation);

        let maxVerseNumber = 0;
        let verses = [];

        lines.forEach(line => {
            const match = line.match(new RegExp(`^${bookAbbreviation}(\\d+):(\\d+)(.*)`));
            if (match) {
                const chapterNumber = parseInt(match[1], 10);
                const verseNumber = parseInt(match[2], 10);
                const verseText = match[3].trim();

                if (chapterNumber === parseInt(selectedChapter)) {
                    verses.push(`<p id="verse-${verseNumber}">${verseNumber}절: ${verseText}</p>`);
                    maxVerseNumber = Math.max(maxVerseNumber, verseNumber);
                }
            }
        });

        // 🔹 절 선택 박스 업데이트
        const verseSelectElement = document.getElementById("verse-select");
        if (verseSelectElement) {
            verseSelectElement.innerHTML = "";
            for (let i = 1; i <= maxVerseNumber; i++) {
                const option = document.createElement("option");
                option.value = i;
                option.textContent = `${i}절`;
                verseSelectElement.appendChild(option);
            }
        }

        // 🔹 Preview div에 모든 절 표시
        const previewElement = document.querySelector(".Preview");
        if (verses.length > 0) {
            previewElement.innerHTML = verses.join("");
        } else {
            previewElement.innerHTML = `<p>${selectedChapter}장에 내용이 없습니다.</p>`;
        }

    } catch (error) {
        console.error(error);
        document.querySelector(".Preview").innerText = "내용을 불러오는 데 실패했습니다.";
    }
}

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // 폼 제출 방지
        performSearch();
    }
});

// 자동완성 관련 변수
let bibleBooks = {};
let reverseBibleBooks = {}; // 전체 이름 → 약어 변환용

// JSON 파일 불러오기
fetch("assets/bible-abbreviations.json")
    .then(response => response.json())
    .then(data => {
        bibleBooks = data;

        // 약어 → 전체 이름 구조를 전체 이름 → 약어 구조로 변환
        for (const [abbr, fullName] of Object.entries(bibleBooks)) {
            reverseBibleBooks[fullName] = abbr;
        }
    })
    .catch(error => console.error("JSON 파일을 불러오는 데 실패했습니다:", error));

// 자동완성 목록 추가할 div 생성
const autocompleteList = document.createElement("div");
autocompleteList.setAttribute("id", "autocomplete-list");
searchInput.parentNode.appendChild(autocompleteList);


// 입력할 때 자동완성 기능 실행
searchInput.addEventListener("input", function () {
    let input = this.value.trim();
    autocompleteList.innerHTML = "";

    if (input.length === 0) {
        autocompleteList.style.display = "none";
        return;
    }

    // 전체 이름이 input으로 시작하는 성경 목록 필터링
    let matches = Object.keys(reverseBibleBooks).filter(book => book.startsWith(input));

    if (matches.length === 0) {
        autocompleteList.style.display = "none";
        return;
    }

    matches.forEach(match => {
        let item = document.createElement("div");
        item.textContent = match; // 전체 이름 표시
        item.style.padding = "5px";
        item.style.cursor = "pointer";

        item.addEventListener("click", function () {
            searchInput.value = reverseBibleBooks[match]; // 클릭 시 약어로 변경
            autocompleteList.style.display = "none";
        });

        autocompleteList.appendChild(item);
    });

    autocompleteList.style.display = "block";
});

// 자동완성 목록 닫기
document.addEventListener("click", function (event) {
    if (event.target !== searchInput) {
        autocompleteList.style.display = "none";
    }
});

async function performSearch() {

    // 오류 메시지 숨기기
    hideError();

    
    const searchValue = searchInput.value.trim();
    const abbreviationData = bibleBooks; // 이미 로드된 약어 데이터 사용

    // 정규식으로 성경 검색 패턴 추출 (예: 빌4:13)
    const match = searchValue.match(/^([가-힣]+)(\d+):(\d+)$/);
    if (!match) {
        showError("올바른 형식으로 입력하세요. (예: 빌4:13)", () => {
            searchInput.focus(); // 포커스를 콜백으로 설정
        });
        return;
    }

    const bookAbbr = match[1]; // "빌"
    const chapter = match[2];  // "4"
    const verse = match[3];    // "13"

    if (!(bookAbbr in abbreviationData)) {
        showError("해당 성경 권을 찾을 수 없습니다.", () => {
            searchInput.focus(); // 포커스를 콜백으로 설정
        });
        return;
    }

    const fullBookName = abbreviationData[bookAbbr]; // "빌립보서"

    console.log(`검색 결과: ${fullBookName} ${chapter}장 ${verse}절`);

    // 성경 권 선택
    const bookSelect = document.getElementById("bible-select");
    let bookFound = false;
    for (let option of bookSelect.options) {
        if (option.textContent === fullBookName) {
            option.selected = true;
            bookFound = true;
            break;
        }
    }
    if (!bookFound) {
        showError("해당 성경을 찾을 수 없습니다.", () => {
            searchInput.focus(); // 포커스를 콜백으로 설정
        });
        return;
    }

    // 장 선택 (비동기 함수 호출)
    await loadBible(bookSelect.value);
    const chapterSelect = document.getElementById("chapter-select");
    chapterSelect.value = chapter;
    chapterSelect.dispatchEvent(new Event("change")); // 장 변경 이벤트 발생

    // 절 선택 (비동기 함수 호출)
    setTimeout(() => {
        const verseSelect = document.getElementById("verse-select");
        verseSelect.value = verse;
        verseSelect.dispatchEvent(new Event("change")); // 절 변경 이벤트 발생
    }, 500);
}

// 오류 메시지 표시 함수
function showError(message, callback) {
    // 기존의 오류 메시지 요소를 삭제
    let existingError = document.getElementById("error-message");
    if (existingError) {
        existingError.remove();
    }

    // 오류 메시지 요소 생성
    const errorMessage = document.createElement("div");
    errorMessage.id = "error-message";
    errorMessage.textContent = message;

    // 입력창 바로 아래에 오류 메시지 추가
    const parent = searchInput.parentNode;
    parent.appendChild(errorMessage);

}

// 오류 메시지 숨기기 함수
function hideError() {
    let existingError = document.getElementById("error-message");
    if (existingError) {
        existingError.remove();
    }
}

