const React = require("react");

const {Component} = React;
const ReactNative = require("react-native");
const createReactClass = require("create-react-class");
const PropTypes = require("prop-types");
const {ViewPropTypes, TextPropTypes} = require("deprecated-react-native-prop-types");

const {Dimensions, View, Animated, ScrollView, Platform, StyleSheet, InteractionManager} = ReactNative;
const TimerMixin = require("react-timer-mixin");
import ViewPagerAndroid from "react-native-pager-view";

const SceneComponent = require("./SceneComponent");

const AnimatedViewPagerAndroid = Platform.OS === "android" ? Animated.createAnimatedComponent(ViewPagerAndroid) : undefined;

const ScrollableTabView = createReactClass({
	mixins: [TimerMixin],

	scrollOnMountCalled: false,

	propTypes: {
		initialPage: PropTypes.number,
		page: PropTypes.number,
		onChangeTab: PropTypes.func,
		onScroll: PropTypes.func,
		style: ViewPropTypes.style,
		contentProps: PropTypes.object,
		scrollWithoutAnimation: PropTypes.bool,
		locked: PropTypes.bool,
		prerenderingSiblingsNumber: PropTypes.number,
		containerWidth: PropTypes.number,
	},

	getDefaultProps() {
		return {
			initialPage: 0,
			page: -1,
			onChangeTab: () => {},
			onScroll: () => {},
			contentProps: {},
			scrollWithoutAnimation: false,
			locked: false,
			prerenderingSiblingsNumber: 0,
			containerWidth: Dimensions.get("window").width,
		};
	},

	getInitialState() {
		let scrollValue;
		let scrollXIOS;
		let positionAndroid;
		let offsetAndroid;

		if (Platform.OS === "ios") {
			scrollXIOS = new Animated.Value(this.props.initialPage * this.props.containerWidth);
			const containerWidthAnimatedValue = new Animated.Value(this.props.containerWidth);
			// Need to call __makeNative manually to avoid a native animated bug. See
			// https://github.com/facebook/react-native/pull/14435
			containerWidthAnimatedValue.__makeNative();
			scrollValue = Animated.divide(scrollXIOS, containerWidthAnimatedValue);

			const callListeners = this._polyfillAnimatedValue(scrollValue);
			scrollXIOS.addListener(({value}) => callListeners(value / this.props.containerWidth));
		} else {
			positionAndroid = new Animated.Value(this.props.initialPage);
			offsetAndroid = new Animated.Value(0);
			scrollValue = Animated.add(positionAndroid, offsetAndroid);

			const callListeners = this._polyfillAnimatedValue(scrollValue);
			let positionAndroidValue = this.props.initialPage;
			let offsetAndroidValue = 0;
			positionAndroid.addListener(({value}) => {
				positionAndroidValue = value;
				callListeners(positionAndroidValue + offsetAndroidValue);
			});
			offsetAndroid.addListener(({value}) => {
				offsetAndroidValue = value;
				callListeners(positionAndroidValue + offsetAndroidValue);
			});
		}

		return {
			currentPage: this.props.initialPage,
			scrollValue,
			scrollXIOS,
			positionAndroid,
			offsetAndroid,
			sceneKeys: this.newSceneKeys({currentPage: this.props.initialPage}),
		};
	},

	componentWillReceiveProps(props) {
		if (props.children !== this.props.children) {
			this.updateSceneKeys({page: this.state.currentPage, children: props.children});
		}

		if (props.page >= 0 && props.page !== this.state.currentPage) {
			this.goToPage(props.page);
		}
	},

	componentWillUnmount() {
		if (Platform.OS === "ios") {
			this.state.scrollXIOS.removeAllListeners();
		} else {
			this.state.positionAndroid.removeAllListeners();
			this.state.offsetAndroid.removeAllListeners();
		}
	},

	goToPage(pageNumber) {
		if (Platform.OS === "ios") {
			const offset = pageNumber * this.props.containerWidth;
			if (this.scrollView) {
				this.scrollView.getNode().scrollTo({x: offset, y: 0, animated: !this.props.scrollWithoutAnimation});
			}
		} else if (this.scrollView) {
			if (this.props.scrollWithoutAnimation) {
				this.scrollView.getNode().setPageWithoutAnimation(pageNumber);
			} else {
				this.scrollView.getNode().setPage(pageNumber);
			}
		}

		const currentPage = this.state.currentPage;
		this.updateSceneKeys({
			page: pageNumber,
			callback: this._onChangeTab.bind(this, currentPage, pageNumber),
		});
	},

	updateSceneKeys({page, children = this.props.children, callback = () => {}}) {
		const newKeys = this.newSceneKeys({previousKeys: this.state.sceneKeys, currentPage: page, children});
		this.setState({currentPage: page, sceneKeys: newKeys}, callback);
	},

	newSceneKeys({previousKeys = [], currentPage = 0, children = this.props.children}) {
		const newKeys = [];
		this._children(children).forEach((child, idx) => {
			const key = this._makeSceneKey(child, idx);
			if (this._keyExists(previousKeys, key) || this._shouldRenderSceneKey(idx, currentPage)) {
				newKeys.push(key);
			}
		});
		return newKeys;
	},

	// Animated.add and Animated.divide do not currently support listeners so
	// we have to polyfill it here since a lot of code depends on being able
	// to add a listener to `scrollValue`. See https://github.com/facebook/react-native/pull/12620.
	_polyfillAnimatedValue(animatedValue) {
		const listeners = new Set();
		const addListener = (listener) => {
			listeners.add(listener);
		};

		const removeListener = (listener) => {
			listeners.delete(listener);
		};

		const removeAllListeners = () => {
			listeners.clear();
		};

		animatedValue.addListener = addListener;
		animatedValue.removeListener = removeListener;
		animatedValue.removeAllListeners = removeAllListeners;

		return (value) => listeners.forEach((listener) => listener({value}));
	},

	_shouldRenderSceneKey(idx, currentPageKey) {
		const numOfSibling = this.props.prerenderingSiblingsNumber;
		return idx < currentPageKey + numOfSibling + 1 && idx > currentPageKey - numOfSibling - 1;
	},

	_keyExists(sceneKeys, key) {
		return sceneKeys.find((sceneKey) => key === sceneKey);
	},

	_makeSceneKey(child, idx) {
		return `${child.props.tabLabel}_${idx}`;
	},

	renderScrollableContent() {
		if (Platform.OS === "ios") {
			const scenes = this._composeScenes();
			return (
				<Animated.ScrollView
					horizontal
					pagingEnabled
					automaticallyAdjustContentInsets={false}
					contentOffset={{x: this.props.initialPage * this.props.containerWidth}}
					ref={(scrollView) => {
						this.scrollView = scrollView;
					}}
					onScroll={Animated.event([{nativeEvent: {contentOffset: {x: this.state.scrollXIOS}}}], {useNativeDriver: true, listener: this._onScroll})}
					onMomentumScrollBegin={this._onMomentumScrollBeginAndEnd}
					onMomentumScrollEnd={this._onMomentumScrollBeginAndEnd}
					scrollEventThrottle={16}
					scrollsToTop={false}
					showsHorizontalScrollIndicator={false}
					scrollEnabled={!this.props.locked}
					directionalLockEnabled
					alwaysBounceVertical={false}
					keyboardDismissMode="on-drag"
					{...this.props.contentProps}
				>
					{scenes}
				</Animated.ScrollView>
			);
		}
		const scenes = this._composeScenes();
		return (
			<AnimatedViewPagerAndroid
				key={this._children().length}
				style={styles.scrollableContentAndroid}
				initialPage={this.props.initialPage}
				onPageSelected={this._updateSelectedPage}
				keyboardDismissMode="on-drag"
				scrollEnabled={!this.props.locked}
				onPageScroll={Animated.event(
					[
						{
							nativeEvent: {
								position: this.state.positionAndroid,
								offset: this.state.offsetAndroid,
							},
						},
					],
					{
						useNativeDriver: true,
						listener: this._onScroll,
					}
				)}
				ref={(scrollView) => {
					this.scrollView = scrollView;
				}}
				{...this.props.contentProps}
			>
				{scenes}
			</AnimatedViewPagerAndroid>
		);
	},

	_composeScenes() {
		return this._children().map((child, idx) => {
			const key = this._makeSceneKey(child, idx);
			return (
				<SceneComponent key={child.key} shouldUpdated={this._shouldRenderSceneKey(idx, this.state.currentPage)} style={{width: this.props.containerWidth}}>
					{this._keyExists(this.state.sceneKeys, key) ? child : <View tabLabel={child.props.tabLabel} />}
				</SceneComponent>
			);
		});
	},

	_onMomentumScrollBeginAndEnd(e) {
		const offsetX = e.nativeEvent.contentOffset.x;
		const page = Math.round(offsetX / this.props.containerWidth);
		if (this.state.currentPage !== page) {
			this._updateSelectedPage(page);
		}
	},

	_updateSelectedPage(nextPage) {
		let localNextPage = nextPage;
		if (typeof localNextPage === "object") {
			localNextPage = nextPage.nativeEvent.position;
		}

		const currentPage = this.state.currentPage;
		this.updateSceneKeys({
			page: localNextPage,
			callback: this._onChangeTab.bind(this, currentPage, localNextPage),
		});
	},

	_onChangeTab(prevPage, currentPage) {
		this.props.onChangeTab({
			i: currentPage,
			ref: this._children()[currentPage],
			from: prevPage,
		});
	},

	_onScroll(e) {
		if (Platform.OS === "ios") {
			const offsetX = e.nativeEvent.contentOffset.x;
			if (offsetX === 0 && !this.scrollOnMountCalled) {
				this.scrollOnMountCalled = true;
			} else {
				this.props.onScroll(offsetX / this.props.containerWidth);
			}
		} else {
			const {position, offset} = e.nativeEvent;
			this.props.onScroll(position + offset);
		}
	},

	_handleLayout(e) {
		const {width} = e.nativeEvent.layout;
		if (!width || width <= 0 || Math.round(width) === Math.round(this.props.containerWidth)) {
			return;
		}
		if (Math.round(width) !== Math.round(this.props.containerWidth)) {
			if (Platform.OS === "ios") {
				const containerWidthAnimatedValue = new Animated.Value(width);
				// Need to call __makeNative manually to avoid a native animated bug. See
				// https://github.com/facebook/react-native/pull/14435
				containerWidthAnimatedValue.__makeNative();
				scrollValue = Animated.divide(this.state.scrollXIOS, containerWidthAnimatedValue);
				this.setState({containerWidth: width, scrollValue});
			} else {
				this.setState({containerWidth: width});
			}
			this.requestAnimationFrame(() => {
				this.goToPage(this.state.currentPage);
			});
		}
	},

	_children(children = this.props.children) {
		return React.Children.map(children, (child) => child);
	},

	render() {
		return (
			<View style={[styles.container, this.props.style]} onLayout={this._handleLayout}>
				{this.renderScrollableContent()}
			</View>
		);
	},
});

module.exports = ScrollableTabView;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollableContentAndroid: {
		flex: 1,
	},
});
