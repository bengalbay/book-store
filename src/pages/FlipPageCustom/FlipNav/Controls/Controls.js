//global dependencies
import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';

//redux
import {
  setCurrentTimeForListenedBook,
  setPageNumbersForOpenedBooks,
  setStateOfAudio
} from "../../../../redux/FairytalesListReducer";

//styles
import '../../pageFlip.css';
import "./styles.css";

// icons - start
import Pause from "../../../../images/controls/controlsPause.svg";
import Play from "../../../../images/controls/controlsPlay.svg";
import volume from "../../../../images/controls/controlsVolume.svg";
import rewindNextIcon from "../../../../images/controls/controlsRewindNext.svg";
import rewindBackIcon from "../../../../images/controls/controlsRewindBack.svg";

class Controls extends Component {
  static propTypes = {
    currentBook: PropTypes.object,
    pageNum: PropTypes.string,
    bookId: PropTypes.string,
    setPageNumbersForOpenedBooks: PropTypes.func,
    setCurrentTimeForListenedBook: PropTypes.func,
    currentRegionsOfNextPage: PropTypes.object,
    setStateOfAudio: PropTypes.func,
    onFlipToNext: PropTypes.func,
    onFlipToPrev: PropTypes.func,
    bookState: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      volumeOff: false,
      isPlaying: false,
      volumeValue: 0.5,
      duration: 0,
      currentTime: 0,
    };
    this.currentTimeRef = React.createRef();
    this.audioRef = React.createRef();
    this.play = this.play.bind(this);
    this.rewindBack = this.rewindBack.bind(this);
    this.rewindNext = this.rewindNext.bind(this);
    this.currentBookSoundRegions = this.props?.currentBook?.bookSound?.regions.find(item => item.data.pageNumber === +this.props.pageNum  );
  }

  componentDidUpdate(prevProps, prevState) {

    if (prevState.currentTime !== this.state.currentTime) {
      this.currentTimeRef.current = +this.state.currentTime;

      if(this.currentBookSoundRegions && (this.currentTimeRef.current > Math.ceil(this.currentBookSoundRegions?.end)) && this.currentBookSoundRegions?.data?.pageNumber === +this.props?.currentBook?.pageNumber) {
        this.props.setPageNumbersForOpenedBooks(+this.props.bookId, +this.props.nextPage + 1, this.props?.currentBook?.bookSound?.regions ? +this.props.currentRegionsOfNextPage.start : 0);
        this.props.onFlipToNext()
      }

      if(this.audioRef.current && +this.state.currentTime === +this.state.duration) {
        this.setState({ isPlaying: false })
        this.audioRef.current.pause()
      }
    }

    if(prevProps?.currentBook?.currentTime !== this.props?.currentBook?.currentTime) {
      this.setState({ currentTime: this.props?.currentBook?.currentTime })
    }

    if(this.audioRef.current && prevProps.pageNum !== this.props.pageNum) {
      // eslint-disable-next-line
      this.audioRef.current.currentTime = this.props?.currentBook?.currentTime
    }

    if(prevProps.bookState !== this.props.bookState) {
      if (this.audioRef.current && !this.audioRef.current.paused && this.props.bookState === 'flipping' && this.currentBookSoundRegions) {
        this.audioRef.current.pause()
        this.setState({ isPlaying: false })
        // eslint-disable-next-line
        this.audioRef.current.currentTime = +this.currentBookSoundRegions?.start - 2.2
      }

      if (this.audioRef.current && this.props.bookState === 'read' && !this.props?.currentBook?.isPause ) {
        this.audioRef.current.play()
        this.setState({ isPlaying: true })
      }
    }
  }

  componentWillUnmount() {
    this.props.setCurrentTimeForListenedBook(this.props?.currentBook?.id, +this.currentTimeRef.current)
  }

  handleChange(e) {
    this.setState({ volumeValue: e.target.value })
    return this.audioRef.current.volume = e.target.value
  }

  play() {

    if(this?.props?.currentBook?.currentTime > 0) {
      this.audioRef.current.currentTime =  this.props.currentBook?.currentTime ;
    }

    if(this?.state?.currentTime) {
      this.audioRef.current.currentTime = this.state.currentTime
    }

    if(!this?.state?.isPlaying) {
      this?.props?.setCurrentTimeForListenedBook(this.props?.currentBook?.id, +this?.currentTimeRef?.current)
      this?.setState({ isPlaying: true })
      this?.audioRef?.current?.play()
      if(+this?.state.currentTime === +this?.state.duration) {
        this?.props.setPageNumbersForOpenedBooks(+this?.props.bookId, 1,0)
      }
      this?.props.setStateOfAudio(this?.props?.currentBook?.id,false)
    }

    if(this?.state?.isPlaying) {
      this?.props.setCurrentTimeForListenedBook(this?.props?.currentBook?.id, +this?.currentTimeRef.current)
      this?.setState({ isPlaying: false })
      this?.audioRef?.current?.pause();
      this?.props.setStateOfAudio(this?.props?.currentBook?.id,true)
    }

  }

  rewindBack(prevPage) {

    if(this?.props?.currentBook?.currentTime > 0) {
      this.audioRef.current.currentTime = this?.props?.currentBook?.currentTime;
    }

    if(this?.audioRef?.current?.currentTime === 0) {
      Math.max(0, this.audioRef.current.currentTime -= 15)

    } else {
      this.audioRef.current.currentTime = this?.props?.currentBook?.currentTime;
      Math.max(0, this.audioRef.current.currentTime -= 15)
    }

    if(( +this?.audioRef?.current?.currentTime <= +this?.currentBookSoundRegions?.start.toFixed(1)) && this?.props?.pageNum !== 1) {
      prevPage()
    }

    this?.props?.setCurrentTimeForListenedBook(this?.props?.currentBook?.id, +Math.max(0, this?.audioRef?.current?.currentTime))
  }

  rewindNext(nextPage) {

    if(this.props?.currentBook?.currentTime > 0) {
      this.audioRef.current.currentTime = this.props?.currentBook?.currentTime;
    }

    if(this.audioRef.current.currentTime === 0) {
      this.audioRef.current.currentTime += 15
    } else {
      this.audioRef.current.currentTime = this.props?.currentBook?.currentTime;
      Math.min(+this.state.duration,  this.audioRef.current.currentTime += 15)
    }

    if((this.audioRef.current.currentTime.toFixed(1) > +this.currentBookSoundRegions?.end.toFixed(1)) && this.props.pageNum > 0) {
      this.props.setPageNumbersForOpenedBooks(+this.props.bookId, +this.props.nextPage + 1, this.props?.currentBook?.bookSound?.regions ? +this.props.currentRegionsOfNextPage.start : 0);
      nextPage()
    } else {
      this.props.setCurrentTimeForListenedBook(this.props?.currentBook?.id, +Math.min(this.state.duration, this.audioRef.current.currentTime))
    }

  }

  secondsToHms(seconds) {
    let duration;

    if (!seconds && !this.props?.currentBook?.currentTime ) {
      return '0 : 00'

    } else if (!seconds) {
      duration = Math.ceil(this.props?.currentBook?.currentTime)

    } else {
      duration = Math.ceil(seconds)
    }

    let hours = duration / 3600
    duration = duration % 3600

    let min = parseInt(duration / 60)
    duration = duration % 60

    let sec = parseInt(duration)

    if (sec < 10) {
      sec = `0${sec}`
    }
    if (min < 10) {
      min = `${min}`
    }

    if (parseInt(hours, 10) > 0) {
      return `${parseInt(hours, 10)}h ${min}m ${sec}s`
    } else if (min === 0) {
      return `0 : ${sec}`
    } else {
      return `${min} : ${sec}`
    }
  }

  render() {
    return (
      <div className={`player`} style={{ margin: '20px auto' }}>

        <audio src={this.props?.currentBook?.bookSound.file}
               ref={this.audioRef}
               onLoadedMetadata={(e) => {
                 this.setState({ duration: e.currentTarget.duration.toFixed(1)})
               }}
               onTimeUpdate={ (e) => {
                 this.setState({ currentTime: e.currentTarget.currentTime.toFixed(1) });
               } }
        />

        <div className={`controls`} style={{ padding: '5px', border: '1px solid #fff' }}>
          <div onClick={this.play} className={`controlPlay`}>
            {
              this.state.isPlaying ? <img src={Pause} alt="player controls"/> : <img src={Play} alt="player controls"/>
            }
          </div>
          <div onClick={() => {
            this.setState({ volumeOff: !this.state.volumeOff })
          }} className={`controlVolume`}>
            <img src={volume} alt="player controls"/>
            {this.state.volumeOff && (
              <input onChange={this.handleChange} className={`volumeRange`} type="range" min={0.1}
                     value={+this.state.volumeValue} step={0.1} max={1.0}/>
            )}
          </div>
          <div onClick={() => this.rewindBack(this.props.onFlipToPrev)} className={`controlRewindPrev`}>
            <img src={rewindBackIcon} alt="player controls"/>
          </div>
          <div onClick={() => this.rewindNext(this.props.onFlipToNext)} className={`controlRewindNext`}>
            <img src={rewindNextIcon} alt="player controls"/>
          </div>
        </div>

        <div className={`playerTimer`}>
          <span>{this.secondsToHms(this.state.currentTime)}</span>
          <span className={`delimeter`} > / </span>
          <span>{this.secondsToHms(this.state.duration)}</span>
        </div>

      </div>
    )
  }
}

export default connect(() => {}, {
  setPageNumbersForOpenedBooks,
  setCurrentTimeForListenedBook,
  setStateOfAudio,
})(Controls);

