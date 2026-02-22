# FindMySens Design System Blueprint v1.0

이 문서는 FindMySens 웹사이트의 유일한 디자인 진실 공급원(Single Source of Truth)이다. 
AI 및 개발자는 UI/UX를 수정하거나 추가할 때 반드시 이 규범을 따라야 한다.

## 1. 핵심 철학 (Core Philosophy)
* **테마:** Dark Cyberpunk / Future Tech / FPS Gamer
* **느낌:** 빠르고, 정밀하고, 어둡지만 핵심 정보는 네온처럼 빛나야 한다.
* **가독성:** 배경은 어둡게 눌러주고 텍스트 대비는 확실하게 가져간다.

## 2. 컬러 팔레트 (Color Palette)
모든 색상은 하드코딩된 HEX 값 대신 CSS 변수(var(--color-name))를 사용하도록 통일한다.

### Primary (배경 및 기본)
* `--bg-main`: #121212 (메인 배경색 - 완전 검정보다는 아주 깊은 회색)
* `--bg-panel`: rgba(255, 255, 255, 0.05) (패널, 카드 배경 - 유리 효과)
* `--bg-panel-hover`: rgba(255, 255, 255, 0.1) (상호작용 시 밝아짐)
* `--border-color`: rgba(255, 255, 255, 0.1) (은은한 테두리)

### Accent (강조 및 네온)
* `--accent-cyan`: #00f2ff (메인 강조색 - 정확도, 버튼, 활성 상태)
* `--accent-magenta`: #ff00ff (보조 강조색 - 특별한 이벤트나 대비가 필요할 때)
* `--accent-orange`: #ff4d00 (경고, 오차 범위 표시)

### Text & Status
* `--text-primary`: #ffffff (기본 텍스트, 제목)
* `--text-secondary`: #94a3b8 (부가 설명, 비활성 텍스트)
* `--status-success`: #22c55e (SSS급, 긍정적 피드백)
* `--status-error`: #ef4444 (놓침, 부정적 피드백)

## 3. 타이포그래피 (Typography)
* **Font Family:**
    * Headings & Data: 'Orbitron', sans-serif (미래지향적 숫자, 제목)
    * Body: 'Inter', system-ui, sans-serif (가독성 좋은 본문)
* **Scale:**
    * H1 (메인 타이틀): 2rem ~ 2.5rem
    * H2 (섹션 타이틀): 1.5rem
    * Body (본문): 1rem (16px)
    * Small (설명글): 0.875rem (14px)

## 4. UI 컴포넌트 규범 (Component Rules)

### Global Reset & Form Elements (가장 중요)
웹 브라우저의 기본 스타일(흰색 배경, 투박한 테두리)은 우리의 다크 테마를 망치는 주범이다. 모든 상호작용 요소는 아래 규칙을 강제로 따라야 한다.

1.  **모든 버튼(`button`), 입력창(`input`), 선택창(`select`), 텍스트 영역(`textarea`)은 브라우저 기본 스타일을 제거해야 한다.**
    * `appearance: none;`, `-webkit-appearance: none;`, `border: none;`, `outline: none;`, `background: transparent;` 를 기본으로 적용한다.
2.  **기본 배경색과 글자색을 강제한다.**
    * 기본 배경: `var(--bg-panel)` (절대 흰색이나 회색 금지)
    * 기본 글자색: `var(--text-primary)`
    * 테두리: `1px solid var(--border-color)`
3.  **Select 드롭다운 옵션:**
    * `<select>` 내부의 `<option>` 태그들도 반드시 어두운 배경(`background: #121212;`)과 흰색 글자를 가져야 한다.

### Buttons (버튼)
* 기본적으로 `--accent-cyan`을 활용한 네온 글로우(box-shadow) 효과를 가진다.
* Hover 시 배경색이 밝아지거나 테두리가 강조되어야 한다.
* 모서리는 약간 둥글게 처리한다 (border-radius: 4px ~ 6px).

### Modals & Panels (모달 및 패널)
* 배경은 반드시 반투명한 유리 효과(Backdrop Filter Blur)를 사용한다.
    * `background: var(--bg-panel); backdrop-filter: blur(10px);`
* 테두리는 아주 얇고 은은하게 빛나야 한다.

### Layout & Overlays (레이아웃 및 오버레이)
* **중앙 정렬:** 모든 오버레이(시작 화면, 결과창)는 부모 컨테이너 내에서 반드시 `display: flex; justify-content: center; align-items: center;`를 통해 정중앙에 위치해야 한다.
* **유연한 확장성:** 결과창과 같이 정보량이 많은 오버레이는 부모의 크기에 갇히지 않도록 `overflow-y: auto;`를 지원해야 하며, 내부 요소들은 `flex-wrap`을 활용해 가독성을 유지해야 한다.

### Grid & Spacing (간격)
* 모든 마진(Margin)과 패딩(Padding)은 4px의 배수를 기본으로 한다 (4, 8, 12, 16, 24px...).
* 요소 간의 간격이 너무 좁아서 답답해 보이지 않도록 충분한 여백(White Space)을 둔다.
