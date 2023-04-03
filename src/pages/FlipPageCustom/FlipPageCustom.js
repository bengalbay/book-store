//global dependencies
import React, {useCallback, useEffect, useRef, useState} from 'react';
import HTMLFlipBook from "react-pageflip";
import {useSelector} from "react-redux";
//styles
import './pageFlip.css';

//components
import Header from "../../components/Header/Header";
import FlipNav from "./FlipNav/FlipNav";
import listenBook from "../../images/controls/audiobook.svg";
import {setTotalPagesForCurrentBook} from "../../redux/FairytalesListReducer";
import Preloader from "../../common/Preloader/Preloader";

//images - start

const FlipPageCustom = React.memo((props) => {

  let bookId = props.match.params.bookId;
  const isFetching = useSelector(state => state.fairytalesList.isFetchingToggle)
  let currentBook = props.touchedBooks.find(item => item.id === +bookId);
  let currentRegionsStart;
  let currentRegionsOfNextPage;
  let currentRegionsOfPrevPage;

  let flipRef = useRef(null);
  const [currentPageNum, setCurrentPageNum] = useState(currentBook.pageNumber || 0);
  const [totalPages, setTotalPages] = useState(currentBook.totalPages || 0);
  const [progress, setProgress] = useState(+currentBook.progress);
  const [bookState, setBookState] = useState('');
  let nextPage = Math.min(+currentPageNum === 0 ? +currentPageNum : (+currentPageNum + 1), totalPages);
  let prevPage = Math.max((+currentPageNum - 1), 0);

  useEffect(() => {
    let readingProgress = Math.floor((+currentPageNum + 1) / totalPages * 100);
    if(currentPageNum === 0) {
      readingProgress = 0
    }
    setProgress(readingProgress !== Infinity ? readingProgress : 0 )
    if(currentPageNum > 0) {
      props.setPageNumbersForOpenedBooks(+bookId,  currentPageNum ?`${+currentPageNum}` : '', +currentBook.currentTime, progress);
    }
    return () => {
      setProgress(readingProgress || 0 );
      props.setPageNumbersForOpenedBooks(+bookId,  currentPageNum ?`${+currentPageNum}` : '', +currentBook.currentTime, progress);
    }
    // eslint-disable-next-line
  }, [currentPageNum, props.bookPagesSort,progress])

  useEffect(() => {
    if(currentPageNum === 0) {
      document.querySelector('.flip-page-parent').closest('.page-flip-wrapper').classList.add('bookStart')
    } else {
      document.querySelector('.flip-page-parent').closest('.page-flip-wrapper').classList.remove('bookStart')
    }
    // eslint-disable-next-line
  }, [currentPageNum])

  if (currentBook.bookSound?.regions) {
    currentRegionsOfNextPage = currentBook.bookSound.regions.find(item => item.data.pageNumber === +nextPage + 1);
    currentRegionsOfPrevPage = currentBook.bookSound.regions.find(item => item.data.pageNumber === +prevPage - 1);
  }

  let flipPages = props.bookPagesSort.map((item, idx) => {
    let bookPageClassName = '';
    if(item.pageNumber > 0) {
      bookPageClassName = 'flip-page';
    } else {
      bookPageClassName = 'page page-cover';
    }
    if(item.pageNumber === 1) {
      bookPageClassName = 'flip-page first-page';
    }
    return (
      <div key={item.pageNumber} className={bookPageClassName}>
        <div className="flip-page-inner">
          <div className="flip-page-text">
            { item.blocks ? item.blocks.map((block,index) =>  {
              if(block.type === 'paragraph') {
                return <p key={index} dangerouslySetInnerHTML={{__html: block.data.text}}/>
              } else if (block.type === 'image') {
                return  <img key={index} src={`${block.data.file.url}`} alt=""/>
              } else {
                return null
              }
            }) : null}
          </div>
          { item.pageNumber > 0
            ? <div className="flip-page-number">{item.pageNumber}</div>
            : <div className="page-cover-title">
              {`${currentBook.title}`}
              <div>
                <span>{currentBook.author}</span>
              </div>
            </div>
          }

        </div>

      </div>
    )
  })
  const onPageTurn = (e) => {

    if (currentBook.bookSound?.regions && (e.object.flipController.state === 'flipping' || e.object.isUserMove)) {

      currentRegionsStart = currentBook.bookSound.regions.find(item => item.data.pageNumber === +e.data);

      props.setPageNumbersForOpenedBooks(+bookId, e.data, ( (currentBook.bookSound?.regions && currentBook.bookSound.regions.length > 0) && e.data > 1 ) ? currentRegionsStart.start : 0);
    }
    setCurrentPageNum(e.data)
  }

  const onChangeState = (state) => {
    setBookState(state)
    if (state === 'flipping' && flipRef && flipRef.current) {
      document.querySelector('.flip-page-parent').classList.add('isFlipping')
    }
    if (state !== 'flipping' && flipRef && flipRef.current) {
      document.querySelector('.flip-page-parent').classList.remove('isFlipping')
    }
  }

  const onInit = useCallback(() => {

    if (flipRef && flipRef.current) {
      setTotalPages(flipRef.current.pageFlip().getPageCount() - 1);
      props.setTotalPagesForCurrentBook(currentBook.id, props.bookPagesSort.length)
      flipRef.current.pageFlip().turnToPage(+currentPageNum)
    }
    // eslint-disable-next-line
  }, [currentPageNum]);

  let onFlipToNext = () => {
    if (flipRef && flipRef.current) {
      flipRef.current.pageFlip().flipNext()
    }
  }

  let onFlipToPrev = () => {
    if (flipRef && flipRef.current) {
      flipRef.current.pageFlip().flipPrev()
    }
  }

  return (
    <div className="flip-page-container">
      <div className="wrapper">
        <div className="flip-page-content">
          <div className="flip-page-header">
            <Header startPage={props.startPage} hideSearch={props.hideSearch}/>
          </div>
          {
            isFetching
              ? <Preloader />
              : <div className={currentPageNum >= 3 ? `page-flip-wrapper static-bg` :`page-flip-wrapper`}>
                <HTMLFlipBook
                  width={420}
                  minWidth={115}
                  maxWidth={420}
                  height={600}
                  maxHeight={600}
                  minHeight={300}
                  ref={flipRef}
                  onChangeState={(e) => onChangeState(e.data)}
                  className="flip-page-parent"
                  onInit={onInit}
                  size="stretch"
                  onFlip={(e) => onPageTurn(e)}
                  mobileScrollSupport={true}
                  showCover={true}
                  renderOnlyPageLengthChange={true}
                >
                  {
                    flipPages
                  }
                </HTMLFlipBook>
                <FlipNav {...props} currentBook={currentBook} flipRef={flipRef} onFlipToNext={onFlipToNext}
                         currentRegionsOfNextPage={currentRegionsOfNextPage}
                         currentRegionsOfPrevPage={currentRegionsOfPrevPage} currentPageNum={currentPageNum}
                         pageNum={currentPageNum} bookId={bookId} prevPage={prevPage} nextPage={nextPage}
                         progress={progress} setProgress={setProgress} totalPages={totalPages} onFlipToPrev={onFlipToPrev}
                         bookState={bookState}  />
              </div>
          }
        </div>
      </div>
    </div>
  );
});

export default FlipPageCustom;