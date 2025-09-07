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

let verses = [];

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
        verses = []; // verses 배열 초기화

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

        //절 선택 박스 업데이트
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


        //Preview div에 모든 절 표시
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
        item.setAttribute("id", "autocomplete-list-item");
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

let pptWindow = null; // PPT 창을 추적하는 변수

// PPT 히스토리 관련 함수들
function loadPPTHistory() {
    const history = JSON.parse(localStorage.getItem('pptHistory') || '[]');
    displayPPTHistory(history);
}

function savePPTHistory(bookName, chapter, verseRange, timestamp) {
    const history = JSON.parse(localStorage.getItem('pptHistory') || '[]');
    
    // 중복 확인: 같은 성경 책과 장이 이미 존재하는지 확인
    const existingIndex = history.findIndex(item => 
        item.bookName === bookName && item.chapter === chapter
    );
    
    const newEntry = {
        id: Date.now(),
        bookName: bookName,
        chapter: chapter,
        verseRange: verseRange,
        timestamp: timestamp
    };
    
    if (existingIndex !== -1) {
        // 기존 항목이 있으면 제거하고 새 항목을 맨 앞에 추가 (최신으로 업데이트)
        history.splice(existingIndex, 1);
        history.unshift(newEntry);
        console.log(`기존 ${bookName} ${chapter}장 기록을 업데이트했습니다.`);
    } else {
        // 새로운 항목이면 맨 앞에 추가
        history.unshift(newEntry);
        console.log(`새로운 ${bookName} ${chapter}장 기록을 추가했습니다.`);
    }
    
    // 최대 20개까지만 저장
    if (history.length > 20) {
        history.splice(20);
    }
    
    localStorage.setItem('pptHistory', JSON.stringify(history));
    displayPPTHistory(history);
}

function displayPPTHistory(history) {
    const historyList = document.getElementById('ppt-history-list');
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">생성된 PPT가 없습니다</div>';
        return;
    }
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'HistoryItem';
        historyItem.innerHTML = `
            <div class="BookTitle">${item.bookName} ${item.chapter}장</div>
            <div class="VerseRange">${item.verseRange}</div>
        `;
        
        // 클릭 시 해당 성경구절로 이동
        historyItem.addEventListener('click', function() {
            loadHistoryItem(item);
        });
        
        historyList.appendChild(historyItem);
    });
}

function loadHistoryItem(item) {
    // 성경 선택
    const bookSelect = document.getElementById("bible-select");
    for (let option of bookSelect.options) {
        if (option.textContent.includes(item.bookName)) {
            option.selected = true;
            break;
        }
    }
    
    // 선택된 성경으로 장 목록 로드
    loadBible(bookSelect.value).then(() => {
        // 장 선택
        const chapterSelect = document.getElementById("chapter-select");
        chapterSelect.value = item.chapter;
        chapterSelect.dispatchEvent(new Event("change"));
        
        // 약간의 지연 후 슬라이드 창 업데이트
        setTimeout(() => {
            // localStorage 업데이트
            localStorage.setItem("selectedBible", bookSelect.value);
            localStorage.setItem("selectedChapter", item.chapter);
            localStorage.setItem("selectedVerse", "1");
            localStorage.setItem('verses', JSON.stringify(verses));
            
            // 열려있는 PPT 창이 있으면 업데이트
            if (pptWindow && !pptWindow.closed) {
                pptWindow.updateVerseDisplay();
                pptWindow.focus();
            }
        }, 600);
    });
}

// 페이지 로드 시 히스토리 초기화 및 표시
document.addEventListener('DOMContentLoaded', function() {
    // 앱 시작 시 기존 히스토리 삭제 (설정은 유지)
    localStorage.removeItem('pptHistory');
    loadPPTHistory();
    
    // 설정이 존재하지 않으면 기본값 설정
    if (!localStorage.getItem('appSettings')) {
        const defaultSettings = {
            backgroundPath: 'assets/bg01.jpg',
            displayId: 'primary',
            titleFontSize: 64,
            contentFontSize: 64,
            titlePosition: 25,
            contentPosition: 70,
            textAlign: 'center'
        };
        localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
    }
});

// 페이지 전환 함수들
function showMainPage() {
    document.getElementById('main-page').style.display = 'block';
    document.getElementById('settings-page').style.display = 'none';
}

function showSettingsPage() {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('settings-page').style.display = 'block';
    loadSettings(); // 설정 페이지 열 때 설정 로드
}

// 설정 로드 함수
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    
    document.getElementById('background-path').value = settings.backgroundPath || 'assets/bg01.jpg';
    document.getElementById('display-select').value = settings.displayId || 'primary';
    
    // 텍스트 스타일링 설정 로드
    document.getElementById('title-font-size').value = settings.titleFontSize || 64;
    document.getElementById('content-font-size').value = settings.contentFontSize || 64;
    document.getElementById('title-position').value = settings.titlePosition || 25;
    document.getElementById('content-position').value = settings.contentPosition || 70;
    document.getElementById('text-align').value = settings.textAlign || 'center';
    
    // 슬라이더 값 표시 업데이트
    updateSliderDisplays();
    
    // 연결된 디스플레이 목록 로드
    loadDisplayList();
}

// 연결된 디스플레이 목록 로드 함수
async function loadDisplayList() {
    try {
        // Electron의 screen API를 사용하여 모든 디스플레이 정보 가져오기
        const displays = await window.electronAPI?.getAllDisplays() || [];
        const displaySelect = document.getElementById('display-select');
        
        // 기존 옵션들 제거 (기본 모니터 제외)
        while (displaySelect.children.length > 1) {
            displaySelect.removeChild(displaySelect.lastChild);
        }
        
        // 각 디스플레이에 대해 옵션 추가
        displays.forEach((display, index) => {
            const option = document.createElement('option');
            option.value = display.id;
            option.textContent = `모니터 ${index + 1} (${display.bounds.width}x${display.bounds.height})`;
            displaySelect.appendChild(option);
        });
    } catch (error) {
        console.log('디스플레이 목록을 가져올 수 없습니다:', error);
    }
}

// 파일 경로 유효성 검사 함수
function validateBackgroundPath(path) {
    try {
        // 이미지 파일 확장자 검사
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        const extension = path.toLowerCase().substring(path.lastIndexOf('.'));
        
        if (!validExtensions.includes(extension)) {
            return false;
        }
        
        // 파일 존재 여부는 실제 사용 시 확인
        return true;
    } catch {
        return false;
    }
}

// 슬라이더 값 표시 업데이트 함수
function updateSliderDisplays() {
    document.getElementById('title-font-value').textContent = document.getElementById('title-font-size').value + 'px';
    document.getElementById('content-font-value').textContent = document.getElementById('content-font-size').value + 'px';
    document.getElementById('title-position-value').textContent = document.getElementById('title-position').value + '%';
    document.getElementById('content-position-value').textContent = document.getElementById('content-position').value + '%';
}

// 설정 저장 함수
function saveSettings() {
    let backgroundPath = document.getElementById('background-path').value.trim();
    
    // 배경 경로 유효성 검사 및 예외처리
    if (!backgroundPath || !validateBackgroundPath(backgroundPath)) {
        backgroundPath = 'assets/bg01.jpg';
        document.getElementById('background-path').value = backgroundPath;
        alert('잘못된 배경 이미지 경로입니다. 기본 배경으로 설정됩니다.');
    }
    
    const settings = {
        backgroundPath: backgroundPath,
        displayId: document.getElementById('display-select').value,
        titleFontSize: parseInt(document.getElementById('title-font-size').value),
        contentFontSize: parseInt(document.getElementById('content-font-size').value),
        titlePosition: parseInt(document.getElementById('title-position').value),
        contentPosition: parseInt(document.getElementById('content-position').value),
        textAlign: document.getElementById('text-align').value
    };
    
    try {
        localStorage.setItem('appSettings', JSON.stringify(settings));
        console.log('설정 저장됨:', settings);
        
        // 설정 저장 후 storage 이벤트를 수동으로 트리거하여 PPT 창 업데이트
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'appSettings',
            newValue: JSON.stringify(settings),
            storageArea: localStorage
        }));
        
        alert('설정이 저장되었습니다.');
        showMainPage();
    } catch (error) {
        console.error('설정 저장 실패:', error);
        alert('설정 저장에 실패했습니다.');
    }
}

// 설정 버튼 클릭 이벤트
document.getElementById("setting-button").addEventListener("click", function() {
    showSettingsPage();
});

// 뒤로가기 버튼 클릭 이벤트
document.getElementById("back-button").addEventListener("click", function() {
    showMainPage();
});

// 설정 페이지 버튼 이벤트들
document.getElementById("save-btn").addEventListener("click", function() {
    saveSettings();
});

document.getElementById("cancel-btn").addEventListener("click", function() {
    showMainPage();
});

// 슬라이더 실시간 업데이트 이벤트들
document.getElementById("title-font-size").addEventListener("input", function() {
    updateSliderDisplays();
});

document.getElementById("content-font-size").addEventListener("input", function() {
    updateSliderDisplays();
});

document.getElementById("title-position").addEventListener("input", function() {
    updateSliderDisplays();
});

document.getElementById("content-position").addEventListener("input", function() {
    updateSliderDisplays();
});

// 배경 이미지 변경 버튼 이벤트
document.getElementById("browse-background").addEventListener("click", async function() {
    try {
        // Electron의 dialog API를 사용하여 파일 선택 다이얼로그 열기
        const result = await window.electronAPI?.openFileDialog({
            title: '배경 이미지 선택',
            filters: [
                { name: '이미지', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
                { name: '모든 파일', extensions: ['*'] }
            ]
        });
        
        if (result && !result.canceled && result.filePaths.length > 0) {
            const selectedPath = result.filePaths[0];
            document.getElementById('background-path').value = selectedPath;
        }
    } catch (error) {
        console.log('파일 선택 다이얼로그를 열 수 없습니다:', error);
        // 폴백: 사용자가 직접 경로 입력할 수 있도록
        const input = document.getElementById('background-path');
        input.removeAttribute('readonly');
        input.focus();
        alert('파일 선택기를 사용할 수 없습니다. 직접 경로를 입력해주세요.');
    }
});

document.getElementById("slide-start-button").addEventListener("click", async function () {
    console.log(verses);

    // 선택된 구절 정보 가져오기
    const selectedBook = document.getElementById('bible-select').value;
    const selectedChapter = document.getElementById('chapter-select').value;
    const selectedVerse = document.getElementById('verse-select').value;
    
    // 선택된 성경 이름 가져오기
    const bookName = document.getElementById('bible-select').selectedOptions[0].textContent;
    
    // 절 범위 계산 (현재 장의 모든 절)
    const verseCount = verses.length;
    const verseRange = `1-${verseCount}절`;

    // 구절 정보를 localStorage에 저장
    localStorage.setItem("selectedBible", selectedBook);
    localStorage.setItem("selectedChapter", selectedChapter);
    localStorage.setItem("selectedVerse", selectedVerse);
    localStorage.setItem('verses', JSON.stringify(verses));
    
    // PPT 히스토리에 저장
    savePPTHistory(bookName, selectedChapter, verseRange, new Date().toLocaleString('ko-KR'));
    
    // Electron API를 사용하여 PPT 창 열기
    try {
        await window.electronAPI.openPPTWindow();
    } catch (error) {
        console.error('PPT 창 열기 실패:', error);
        // 폴백: 기존 방식으로 창 열기
        if (!pptWindow || pptWindow.closed) {
            pptWindow = window.open("ppt.html", "_blank", "toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=1200,height=800");
        } else {
            pptWindow.updateVerseDisplay();
            pptWindow.focus();
        }
    }
});



