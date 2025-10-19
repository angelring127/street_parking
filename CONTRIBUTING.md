# 기여 가이드

Vancouver Street Parking Price Finder 프로젝트에 기여해주셔서 감사합니다!

## 개발 환경 설정

### 1. 저장소 포크 및 클론

```bash
git clone https://github.com/YOUR_USERNAME/street_parking_price.git
cd street_parking_price
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터 다운로드

```bash
npm run update-data
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 코드 스타일

### TypeScript

- 타입을 명시적으로 선언하세요
- `any` 타입 사용을 피하세요
- 인터페이스와 타입을 적절히 활용하세요

### 변수명

- 이해하기 쉬운 의미있는 이름 사용
- camelCase 사용 (함수, 변수)
- PascalCase 사용 (컴포넌트, 타입, 인터페이스)

### 주석

- 일본어로 작성 (프로젝트 규칙)
- 복잡한 로직에는 설명 주석 추가
- JSDoc 스타일 함수 주석 권장

예시:

```typescript
/**
 * 二つの地点間の距離を計算
 * @param lat1 - 緯度1
 * @param lon1 - 経度1
 * @param lat2 - 緯度2
 * @param lon2 - 経度2
 * @returns 距離 (km)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // Implementation
};
```

### 컴포넌트

- 하나의 파일에 하나의 컴포넌트
- Props 타입을 인터페이스로 정의
- `'use client'` 지시자를 적절히 사용

## Pull Request 프로세스

### 1. 이슈 확인 또는 생성

- 기존 이슈를 확인하세요
- 없다면 새 이슈를 만들어 논의하세요

### 2. 브랜치 생성

```bash
git checkout -b feature/your-feature-name
# 또는
git checkout -b fix/your-bug-fix
```

### 3. 변경사항 커밋

```bash
git add .
git commit -m "✨ Add feature: your feature description"
```

커밋 메시지 컨벤션:

- `✨ feat:` - 새로운 기능
- `🐛 fix:` - 버그 수정
- `📝 docs:` - 문서 변경
- `💄 style:` - 코드 포맷팅
- `♻️ refactor:` - 리팩토링
- `✅ test:` - 테스트 추가
- `⚡ perf:` - 성능 개선

### 4. 푸시 및 PR 생성

```bash
git push origin feature/your-feature-name
```

GitHub에서 Pull Request를 생성하세요.

## 기여 아이디어

### 기능 개선

- [ ] 다국어 지원 (영어, 한국어, 일본어)
- [ ] 즐겨찾기 기능
- [ ] 주차 가능 여부 실시간 확인
- [ ] 경로 안내 기능
- [ ] PWA (Progressive Web App) 지원
- [ ] 다크 모드

### UI/UX 개선

- [ ] 더 나은 모바일 UI
- [ ] 애니메이션 추가
- [ ] 접근성 개선
- [ ] 로딩 상태 개선

### 성능 최적화

- [ ] 데이터 압축
- [ ] 가상 스크롤링
- [ ] 이미지 최적화
- [ ] 코드 스플리팅

### 백엔드 기능

- [ ] 사용자 인증
- [ ] 리뷰 시스템
- [ ] 북마크 동기화
- [ ] API 서버

## 질문이나 제안

- GitHub Issues를 통해 질문하세요
- 아이디어나 제안도 환영합니다!

## 행동 강령

- 존중하는 태도로 소통하세요
- 건설적인 피드백을 제공하세요
- 다양성을 존중하세요

감사합니다! 🙏
