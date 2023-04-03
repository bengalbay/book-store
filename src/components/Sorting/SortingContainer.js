import Sorting from "./Sorting";
import {connect} from "react-redux";
import {
  changeSelectedAuthorName, getBooksFromSorting,
  isOpenSortingAc,
  setAuthorNames,
  setBooksListFromSorting, setSelectedAuthorName, setSelectedGenre, sortingByTextAndAudio
} from "../../redux/sortingReducers";
import {useEffect, useState} from "react";
import {setSortingResults} from "../../redux/SearchReducer";
import {showOnlyFreeBooks} from "../../redux/FairytalesListReducer";

const SortingContainer = (props) => {

  const [sortingToggle, setSortingToggle] = useState(false);

  useEffect(() => {
    if (props.books.length > 0) {
      let emptyAuthor = props.books.filter(item => item.published).map(item => item.author);
      emptyAuthor.unshift("Choose author");
      let uniqueSet = new Set(emptyAuthor);
      props.setAuthorNames([...uniqueSet])
    }
    // eslint-disable-next-line
  }, [props.books])

  return (
    <Sorting {...props} setSortingToggle={setSortingToggle}  sortingToggle={sortingToggle} />
  )
}

let mapStateToProps = (state) => {
  return {
    books: state.fairytalesList.books,
    authorNames: state.sorting.authorNames,
    authorNamesIsToggle: state.sorting.authorNamesIsToggle,
    booksListFromSorting: state.sorting.booksListFromSorting,
    bookTitle: state.searching.bookTitle,
    sortingResults: state.searching.sortingResults,
    sortByTextAndAudio: state.sorting.sortByTextAndAudio,
    showFreeBooks: state.fairytalesList.showFreeBooks,
    genreList: state.sorting.genreList,
    selectedGenre: state.sorting.selectedGenre,
    selectedGenreId: state.sorting.selectedGenre.genreId,
    selectedAuthorName: state.sorting.selectedAuthorName
  }
}

export default connect(mapStateToProps, {isOpenSortingAc, setAuthorNames,
                                                          changeSelectedAuthorName, setBooksListFromSorting ,
                                                          getBooksFromSorting, setSortingResults,showOnlyFreeBooks,
                                                          sortingByTextAndAudio,setSelectedGenre,setSelectedAuthorName })(SortingContainer)