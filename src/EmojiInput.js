import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    TextInput,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    RecyclerListView,
    DataProvider,
    LayoutProvider
} from 'recyclerlistview';
import Triangle from 'react-native-triangle';
import _ from 'lodash';
import {
    responsiveFontSize
} from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import EmojiSearchSpace from "./EmojiSearch";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Fue from 'react-native-emoji-input/src/svg/Fue';
import Smile from 'react-native-emoji-input/src/svg/Smile';
import Animal from 'react-native-emoji-input/src/svg/Animal';
import Food from 'react-native-emoji-input/src/svg/Food';
import Activity from 'react-native-emoji-input/src/svg/Activity';
import Travel from 'react-native-emoji-input/src/svg/Travel';
import Object from 'react-native-emoji-input/src/svg/Object';
import Symbol from 'react-native-emoji-input/src/svg/Symbol';
import Sticker from 'react-native-emoji-input/src/svg/Sticker';
import Giffy from 'react-native-emoji-input/src/svg/Giffy';
import Flag from 'react-native-emoji-input/src/svg/Flag';
import Emoji from './Emoji';


const {
    category,
    categoryIndexMap,
    emojiLib,
    emojiArray
} = require('./emoji-data/compiled');

const categoryIcon = {


    fue: props => <Fue height={23} width={23}  {...props} fill={'#868686'} />,
    people: props => <Smile height={23} width={23} {...props} fill={'#868686'} />,
    animals_and_nature: props => (
        <Animal height={23} width={23} fill={'#868686'} {...props} />
    ),
    food_and_drink: props => (
        <Food height={23} width={23} fill={'#868686'} {...props} />
    ),
    activity: props => (
        <Activity height={23} width={23} fill={'#868686'} {...props} />
    ),
    travel_and_places: props => (
        <Travel height={23} width={23} fill={'#868686'} {...props} />
    ),
    objects: props => (
        <Object height={23} width={23} fill={'#868686'} {...props} />
    ),
    symbols: props => <Symbol height={23} width={23} fill={'#868686'}  {...props} />,
    flags: props => <Flag height={23} width={23} fill={'#868686'} {...props} />,
};

const { width: WINDOW_WIDTH } = Dimensions.get('window');

const ViewTypes = {
    EMOJI: 0,
    CATEGORY: 1
};

// fromCodePoint polyfill
if (!String.fromCodePoint) {
    (function () {
        var defineProperty = (function () {
            // IE 8 only supports `Object.defineProperty` on DOM elements
            try {
                var object = {};
                var $defineProperty = Object.defineProperty;
                var result =
                    $defineProperty(object, object, object) && $defineProperty;
            } catch (error) { }
            return result;
        })();
        var stringFromCharCode = String.fromCharCode;
        var floor = Math.floor;
        var fromCodePoint = function () {
            var MAX_SIZE = 0x4000;
            var codeUnits = [];
            var highSurrogate;
            var lowSurrogate;
            var index = -1;
            var length = arguments.length;
            if (!length) {
                return '';
            }
            var result = '';
            while (++index < length) {
                var codePoint = Number(arguments[index]);
                if (
                    !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
                    codePoint < 0 || // not a valid Unicode code point
                    codePoint > 0x10ffff || // not a valid Unicode code point
                    floor(codePoint) != codePoint // not an integer
                ) {
                    throw RangeError('Invalid code point: ' + codePoint);
                }
                if (codePoint <= 0xffff) {
                    // BMP code point
                    codeUnits.push(codePoint);
                } else {
                    // Astral code point; split in surrogate halves
                    // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                    codePoint -= 0x10000;
                    highSurrogate = (codePoint >> 10) + 0xd800;
                    lowSurrogate = (codePoint % 0x400) + 0xdc00;
                    codeUnits.push(highSurrogate, lowSurrogate);
                }
                if (index + 1 == length || codeUnits.length > MAX_SIZE) {
                    result += stringFromCharCode.apply(null, codeUnits);
                    codeUnits.length = 0;
                }
            }
            return result;
        };
        if (defineProperty) {
            defineProperty(String, 'fromCodePoint', {
                value: fromCodePoint,
                configurable: true,
                writable: true
            });
        } else {
            String.fromCodePoint = fromCodePoint;
        }
    })();
}

class EmojiInput extends React.PureComponent {
    constructor(props) {
        super(props);

        if (this.props.enableFrequentlyUsedEmoji) this.getFrequentlyUsedEmoji();

        this.emojiSize = _.floor(props.width / this.props.numColumns);

        this.emoji = [];

        this.loggingFunction = this.props.loggingFunction
            ? this.props.loggingFunction
            : null;

        this.verboseLoggingFunction = this.props.verboseLoggingFunction
            ? this.props.verboseLoggingFunction
            : false;

        let dataProvider = new DataProvider((e1, e2) => {
            return e1.char !== e2.char;
        });

        this._layoutProvider = new LayoutProvider(
            index =>
                _.has(this.emoji[index], 'categoryMarker')
                    ? ViewTypes.CATEGORY
                    : ViewTypes.EMOJI,
            (type, dim) => {
                switch (type) {
                    case ViewTypes.CATEGORY:
                        dim.height = this.props.categoryLabelHeight;
                        dim.width = props.width;
                        break;
                    case ViewTypes.EMOJI:
                        dim.height = dim.width = this.emojiSize;
                        break;
                }
            }
        );

        this._rowRenderer = this._rowRenderer.bind(this);
        this._isMounted = false;

        this.state = {
            dataProvider: dataProvider.cloneWithRows(this.emoji),
            currentCategoryKey: this.props.enableFrequentlyUsedEmoji
                ? category[0].key
                : category[1].key,
            searchQuery: '',
            height: new Animated.Value(64),
            scrollDirection: 'up',
            emptySearchResult: false,
            frequentlyUsedEmoji: {},
            previousLongestQuery: '',
            selectedEmoji: null,
            clickaction:false,
            offsetY: 0
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.search();
    }


    setAnimation(disable) {
        Animated.timing(this.state.height, {
            duration: 100,
            toValue: disable ? 0 : 64
        }).start()
    };


    componentDidUpdate(prevProps, prevStates) {
        if (this.props.resetSearch) {
            this.textInput.clear();
            this.setState({
                searchQuery: ''
            });
        }
        if (
            prevStates.searchQuery !== this.state.searchQuery ||
            prevStates.frequentlyUsedEmoji !== this.state.frequentlyUsedEmoji
        ) {
            this.search();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getFrequentlyUsedEmoji = () => {
        AsyncStorage.getItem('@EmojiInput:frequentlyUsedEmoji').then(
            frequentlyUsedEmoji => {
                if (frequentlyUsedEmoji !== null) {
                    frequentlyUsedEmoji = JSON.parse(frequentlyUsedEmoji);
                    this.setState({ frequentlyUsedEmoji });
                }
            }
        );
    };

    addFrequentlyUsedEmoji = data => {
        let emoji = data.key;
        let { frequentlyUsedEmoji } = this.state;
        if (_(frequentlyUsedEmoji).has(emoji)) {
            frequentlyUsedEmoji[emoji]++;
        } else {
            frequentlyUsedEmoji[emoji] = 1;
        }
        this.setState({ frequentlyUsedEmoji });
        AsyncStorage.setItem(
            '@EmojiInput:frequentlyUsedEmoji',
            JSON.stringify(frequentlyUsedEmoji)
        );
    };

    clearFrequentlyUsedEmoji = () => {
        AsyncStorage.removeItem('@EmojiInput:frequentlyUsedEmoji');
    };

    search = () => {
        let query = this.state.searchQuery;
        this.setState({ emptySearchResult: false });

        if (query) {
            let result = _(EmojiSearchSpace.search(query).slice(0, 50)) // Only show top 50 relevant results
                .map(({ emoji_key }) => emojiLib[emoji_key])           // speeds up response time
                .value();

            if (!result.length) {
                this.setState({ emptySearchResult: true });
                if (this.loggingFunction) {
                    if (this.verboseLoggingFunction) {
                        this.loggingFunction(query, 'emptySearchResult');
                    } else {
                        this.loggingFunction(query);
                    }
                }
            }
            this.emojiRenderer(result);
            setTimeout(() => {
                if (this._isMounted) {
                    this._recyclerListView._pendingScrollToOffset = null;
                    this._recyclerListView.scrollToTop(false);
                }
            }, 15);
        } else {
            let fue = _(this.state.frequentlyUsedEmoji)
                .toPairs()
                .sortBy([1])
                .reverse()
                .map(([key]) => key)
                .value();
            fue = _(this.props.defaultFrequentlyUsedEmoji)
                .concat(fue)
                .take(this.props.numFrequentlyUsedEmoji)
                .value();
            let _emoji = _(emojiLib)
                .pick(fue)
                .mapKeys((v, k) => `FUE_${k}`)
                .mapValues(v => ({ ...v, category: 'fue' }))
                .extend(emojiLib)
                .value();
            this.emojiRenderer(_emoji);
        }
    };

    emojiRenderer = emojis => {
        let dataProvider = new DataProvider((e1, e2) => {
            return e1.char !== e2.char;
        });

        this.emoji = [];
        let categoryIndexMap = _(category)
            .map((v, idx) => ({ ...v, idx }))
            .keyBy('key')
            .value();

        let tempEmoji = _
            .range(_.size(category))
            .map((v, k) => [
                { char: category[k].key, categoryMarker: true, ...category[k] }
            ]);
        _(emojis)
            .values()
            .filter(emoji => _.every(this.props.filterFunctions, fn => fn(emoji)))
            .each(e => {
                if (_.has(categoryIndexMap, e.category)) {
                    tempEmoji[categoryIndexMap[e.category].idx].push(e);
                }
            });
        let accurateY = 0;
        let lastCount = 0;
        let s = 0;
        _(tempEmoji).each(v => {
            let idx = categoryIndexMap[v[0].key].idx;
            let c = category[idx];

            c.idx = s;
            s = s + lastCount;

            c.y =
                _.ceil(lastCount / this.props.numColumns) * this.emojiSize +
                accurateY;
            accurateY =
                c.y + (_.size(v) === 1 ? 0 : this.props.categoryLabelHeight);

            lastCount = _.size(v) - 1;
        });
        this.emoji = _(tempEmoji)
            .filter(c => c.length > 1)
            .flatten(tempEmoji)
            .value();
        if (
            !this.props.showCategoryTitleInSearchResults &&
            this.state.searchQuery
        ) {
            this.emoji = _.filter(this.emoji, c => !c.categoryMarker);
        }

        _.reduce(
            this.emoji,
            ({ x, y, i, previousDimension }, emoji) => {
                const layoutType = this._layoutProvider.getLayoutTypeForIndex(
                    i
                );
                const dimension = { width: 0, height: 0 };
                this._layoutProvider._setLayoutForType(
                    layoutType,
                    dimension,
                    i
                );

                x = x + dimension.width;
                if (x > this.props.width) {
                    x = dimension.width;
                    y = y + previousDimension.height;
                }

                emoji.y = y;
                emoji.x = x - dimension.width;

                return { x, y, i: i + 1, previousDimension: dimension };
            },
            { x: 0, y: 0, i: 0, previousDimension: null }
        );
        this.setState({
            dataProvider: dataProvider.cloneWithRows(this.emoji)
        });
    };

    _rowRenderer(type, data) {
        switch (type) {
            case ViewTypes.CATEGORY:
                return (
                    <Text
                        style={[
                            styles.categoryText,
                            { ...this.props.categoryLabelTextStyle }
                        ]}
                    >
                        {data.title}
                    </Text>
                );
            case ViewTypes.EMOJI:
                return (
                    <Emoji
                        onPress={this.handleEmojiPress}
                        onLongPress={this.handleEmojiLongPress}
                        data={data}
                        size={this.props.emojiFontSize}
                    />
                );
        }
    }

    handleCategoryPress = key => {
        this._recyclerListView.scrollToOffset(
            0,
            category[categoryIndexMap[key].idx].y + 1,
            false
        );

        this.setState({clickaction: true})
    };

    handleScroll = (rawEvent, offsetX, offsetY) => {

        const {clickaction} = this.state

        var currentOffset = offsetY;
        var direction = currentOffset > this.offset && currentOffset != 0 ? 'down' : 'up';
        this.offset = currentOffset;
        console.log(direction);

        if(clickaction != true){
            this.setState({ scrollDirection: direction})
        }else{
            setTimeout(() => {
                this.setState({clickaction: false})
            }, 100);
            this.setState({offsetY: currentOffset})
        }

        console.log('offsetX====================================');
        console.log(offsetX);
        console.log('====================================');
        let idx = _(category).findLastIndex(c => c.y < offsetY);
        if (idx < 0) idx = 0;
        this.setState({
            currentCategoryKey: category[idx].key,
            selectedEmoji: null,
            offsetY,

        });
    };

    handleEmojiPress = data => {
        this.props.onEmojiSelected(data);
        if (_.has(data, 'derivedFrom')) {
            data = data.derivedFrom;
        }
        if (this.props.enableFrequentlyUsedEmoji)
            this.addFrequentlyUsedEmoji(data);
        this.hideSkinSelector();
    };

    handleEmojiLongPress = data => {
        if (!_.has(data, ['lib', 'skin_variations'])) return;
        this.setState({ selectedEmoji: data });
    };

    hideSkinSelector = () => {
        this.setState({ selectedEmoji: null });
    };

    render() {
        const { selectedEmoji, offsetY, scrollDirection, height } = this.state;
        const { enableSearch, width, renderAheadOffset } = this.props;
        return (
            <View
                style={{
                    flex: 1,
                    width,
                    backgroundColor: this.props.keyboardBackgroundColor,
                    position: 'relative'
                }}
            >
                <View style={styles.topnavigation}>
                    <View style={styles.topMenu}>

                        <TouchableOpacity style={{marginHorizontal:10}}>
                            <Smile   height={28} width={28} fill={'#8b8b8b'} />
                        </TouchableOpacity>

                        <TouchableOpacity style={{marginHorizontal:10}}>
                            <Sticker stroke="#8b8b8b" height={28} width={28} fill={'#8b8b8b'} />
                        </TouchableOpacity>

                        <TouchableOpacity style={{marginHorizontal:10}}>
                            <Giffy  height={28} width={28} fill={'#8b8b8b'} />
                        </TouchableOpacity>
                    </View>
                </View>
                {enableSearch && (
                    <></>
                )}
                {this.state.emptySearchResult && (
                    <View style={styles.emptySearchResultContainer}>
                        <Text>No search results.</Text>
                    </View>
                )}
                <RecyclerListView
                    style={{ flex: 1, }}
                    forceNonDeterministicRendering={true}
                    renderAheadOffset={renderAheadOffset}
                    layoutProvider={this._layoutProvider}
                    dataProvider={this.state.dataProvider}
                    rowRenderer={this._rowRenderer}
                    ref={component => (this._recyclerListView = component)}
                    onScroll={this.handleScroll}
                />

                {!this.state.searchQuery &&
                    this.props.showCategoryTab && (
                        <TouchableWithoutFeedback>
                            <Animatable.View
                                elevation={3}
                                style={{...styles.footerContainer, display: scrollDirection == 'up' ? 'flex' : 'none'}}
                                animation="slideInUp">
                            {_
                                .drop(
                                    category,
                                    this.props.enableFrequentlyUsedEmoji
                                        ? 0
                                        : 1
                                )
                                .map(({ key }) => {

                                    return (
                                        <TouchableOpacity
                                            key={key}
                                            onPress={() =>
                                                this.handleCategoryPress(key)

                                            }
                                            style={styles.categoryIconContainer}
                                        >

                                            <View>
                                                {categoryIcon[key]({
                                                    color:
                                                        key ===
                                                            this.state
                                                                .currentCategoryKey
                                                            ? this.props
                                                                .categoryHighlightColor
                                                            : this.props
                                                                .categoryUnhighlightedColor,
                                                    size: this.props
                                                        .categoryFontSize
                                                })}
                                            </View>
                                        </TouchableOpacity>

                                    )


                                })
                            }
                        </Animatable.View>
                        </TouchableWithoutFeedback>
        )
    }
                {
    selectedEmoji && (
        <Animatable.View
            animation="bounceIn"
            style={[
                styles.skinSelectorContainer,
                {

                    top:
                        selectedEmoji.y -
                        offsetY -
                        width / this.props.numColumns +
                        (enableSearch ? 35 : 0)
                }
            ]}
        >
            <View
                style={[
                    styles.skinSelector,
                    {
                        height: this.props.emojiFontSize + 20
                    }
                ]}
            >
                {_(_.get(selectedEmoji, ['lib', 'skin_variations']))
                    .map(data => {
                        return (
                            <View
                                style={styles.skinEmoji}
                                key={data.unified}
                            >
                                <Emoji
                                    onPress={this.handleEmojiPress}
                                    data={{
                                        ...data,
                                        derivedFrom: selectedEmoji
                                    }}
                                    size={this.props.emojiFontSize}
                                />
                            </View>
                        );
                    })
                    .value()}
            </View>
            <View
                style={[
                    styles.skinSelectorTriangleContainer,
                    {
                        marginLeft:
                            selectedEmoji.x +
                            width / this.props.numColumns / 2 -
                            30 / 2
                    }
                ]}
            >
                <Triangle
                    width={30}
                    height={20}
                    color={'#fff'}
                    direction={'down'}
                />
            </View>
        </Animatable.View>
    )
}
            </View >
        );
    }
}

EmojiInput.defaultProps = {
    keyboardBackgroundColor: '#E9E9E9',
    width: WINDOW_WIDTH,
    numColumns: 6,

    showCategoryTab: true,
    showCategoryTitleInSearchResults: false,
    categoryUnhighlightedColor: 'lightgray',
    categoryHighlightColor: 'black',
    enableSearch: true,

    enableFrequentlyUsedEmoji: true,
    numFrequentlyUsedEmoji: 18,
    defaultFrequentlyUsedEmoji: [],

    categoryLabelHeight: 45,
    categoryLabelTextStyle: {
        fontSize: 25
    },
    emojiFontSize: 40,
    categoryFontSize: 20,
    resetSearch: false,
    filterFunctions: [],
    renderAheadOffset: 1500
};

EmojiInput.propTypes = {
    keyboardBackgroundColor: PropTypes.string,
    width: PropTypes.number,
    numColumns: PropTypes.number,
    emojiFontSize: PropTypes.number,

    onEmojiSelected: PropTypes.func.isRequired,

    showCategoryTab: PropTypes.bool,
    showCategoryTitleInSearchResults: PropTypes.bool,
    categoryFontSize: PropTypes.number,
    categoryUnhighlightedColor: PropTypes.string,
    categoryHighlightColor: PropTypes.string,
    categorySize: PropTypes.number,
    categoryLabelHeight: PropTypes.number,
    enableSearch: PropTypes.bool,
    categoryLabelTextStyle: PropTypes.object,

    enableFrequentlyUsedEmoji: PropTypes.bool,
    numFrequentlyUsedEmoji: PropTypes.number,
    defaultFrequentlyUsedEmoji: PropTypes.arrayOf(PropTypes.string),
    resetSearch: PropTypes.bool,
    filterFunctions: PropTypes.arrayOf(PropTypes.func),
    renderAheadOffset: PropTypes.number
};

const styles = {
    cellContainer: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: 1
    },
    footerContainer: {
        width: '100%',
        paddingVertical: 12,
        borderTopStyle: "solid",
        elevation: 3,
        borderColor: '#868686',
        borderWidth: 0.5,
        borderBottomWidth: 0,
        backgroundColor: '#E9E9E9',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        flexDirection: 'row',
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 10,
        shadowOpacity: 1.0
    },
    emptySearchResultContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 20
    },
    topnavigation:{
        height:43,
        backgroundColor:'#E9E9E9',
        borderTopStyle: "solid",
        borderBottomWidth:0.1,
        justifyContent:'center',
        alignItems:'center',
        elevation:1,
        borderBottomColor:'#868686',
    },
    emojiText: {
        color: 'black',
        fontWeight: 'bold'
    },
    categoryText: {
        color: '#8B8B8B',
        // fontWeight: 'bold',
        paddingVertical: 10,
        paddingLeft: 10
    },
    categoryIconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    topMenu:{
      flexDirection:'row',
    },
    skinSelectorContainer: {
        width: '100%',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        position: 'absolute'
    },
    skinSelector: {
        width: '100%',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#fff'
    },
    skinSelectorTriangleContainer: {
        height: 20
    },
    skinEmoji: {
        flex: 1
    }
};

export default EmojiInput;
