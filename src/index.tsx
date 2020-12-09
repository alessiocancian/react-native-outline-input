import React, {
  memo, useRef, useState, useCallback,
} from 'react';
import {
  Animated,
  Easing,
  EasingFunction,
  StyleSheet,
	View,
	Text,
  TextInput,
  ViewStyle,
  TextInputProps,
	TouchableWithoutFeedback,
} from 'react-native';
  
type secureTextEntryType = true | false;
type autoCapitalizeType = 'characters' | 'words' | 'sentences' | 'none';
  
interface PropTypes {
  label: string;
  onChangeText?: any;
  value?: string;
  secureTextEntry?: secureTextEntryType;
  autoCapitalize?: autoCapitalizeType;
  fontSize?: number;
  height?: number;
  duration?: number;
  easing?: EasingFunction;
  activeValueColor?:string;
  passiveValueColor?:string;
  activeLabelColor?: string;
  passiveLabelColor?: string;
  activeBorderColor?: string;
  passiveBorderColor?: string;
	backgroundColor?: string;
	disabledBackgroundColor?: string,
  fontFamily?: string;
  customInputStyle?: ViewStyle;
  customContainerStyle?: ViewStyle;
  customLabelStyle?: ViewStyle;
  textInputProps?: TextInputProps
	disabled?: boolean
	textAfterInput?: string
	customAction?: () => void
}
  
interface CommonAnimatedPropsTypes {
  duration: number;
  useNativeDriver: boolean;
  easing: EasingFunction;
}
  
interface LabelStylePropTypes {
  isFocused: boolean;
  initialTopValue: number;
  activeLabelColor: string;
  passiveLabelColor: string;
}
  
interface InputStyleProps {
  padding: number;
  height: number;
  fontSize: number;
  isFocused: boolean;
  activeValueColor:string;
  passiveValueColor:string;
}
  
const OutlineInput = ({
  label,
  onChangeText,
  value,
  secureTextEntry = false,
  autoCapitalize = 'none',
  fontSize = 16,
  height = 56,
  duration = 300,
  easing = Easing.inOut(Easing.ease),
  activeValueColor = '#51AD56',
  passiveValueColor = '#757575',
  activeLabelColor = '#51AD56',
  passiveLabelColor = '#757575',
  activeBorderColor = '#51AD56',
  passiveBorderColor = '#EFEFEF',
	backgroundColor = "#ffffff",
	disabledBackgroundColor = "#e2e2e2",
  fontFamily = 'System',
  customInputStyle = {},
  customContainerStyle = {},
  customLabelStyle = {},
  textInputProps = {},
	disabled = false,
	textAfterInput,
	customAction,
}: PropTypes) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const lineHeightValue: number = fontSize + 5;
  const scaledLineHeight = lineHeightValue * 0.8
  const initialTopValue: number = (height - lineHeightValue) / 2;
  const labelPositionEmptyValue: number = 0;
  const inputValueFontSize: number = fontSize;
  const padding: number = 8;
  const labelPositionFillValue: number = lineHeightValue / 2 + initialTopValue;
  const inputHeight: number = height;
  
  const labelPositionRef = useRef(
    new Animated.Value(
      value ? labelPositionFillValue : labelPositionEmptyValue,
    ),
  ).current;
  const scaleRef = useRef(
    new Animated.Value(value ? 0.8 : 1.0),
  ).current;
  const zIndexRef = useRef(new Animated.Value(value ? 2 : -1)).current;

  const commonAnimatedProps: CommonAnimatedPropsTypes = {
    duration,
    useNativeDriver: false,
    easing,
  };

  const onBlur: () => void = useCallback(() => {
    setIsFocused(false);
    if (!value) {
      Animated.parallel([
        Animated.timing(labelPositionRef, {
          toValue: labelPositionEmptyValue,
					...commonAnimatedProps,
        }),
				Animated.timing(scaleRef, {
					toValue: 1.0,
					...commonAnimatedProps,
				}),
        Animated.timing(zIndexRef, {
          toValue: -1,
          ...commonAnimatedProps,
        }),
      ]).start();
    }
  }, [!!value]);

  const onFocus: () => void = useCallback(() => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(labelPositionRef, {
        toValue: labelPositionFillValue,
				...commonAnimatedProps,
			}),
			Animated.timing(scaleRef, {
				toValue: 0.8,
				...commonAnimatedProps,
			}),
      Animated.timing(zIndexRef, {
        toValue: 2,
        ...commonAnimatedProps,
      }),
    ]).start();
  }, [!!value]);

  const animatedTextProps = {
    style: [
      LabelStyle({
        isFocused,
        initialTopValue,
        activeLabelColor,
        passiveLabelColor,
      }),
      {
        fontSize,
        fontFamily, 
				zIndex: 10,
				alignItems: "center"
      },
      customLabelStyle
    ],
  };

  const inputProps = {
    secureTextEntry,
    value,
    onChangeText,
    onFocus,
    onBlur,
    autoCapitalize,
    isFocused,
    //height: inputHeight,
    padding,
    fontSize: inputValueFontSize,
    activeBorderColor,
    passiveBorderColor,
    style: [
      { fontFamily, paddingLeft: 12 },
      InputStyle({
        padding,
        height,
        fontSize,
        isFocused,
        activeValueColor,
        passiveValueColor,
      }),
      customInputStyle
    ],
	};
	
	const inputContainerStyle = [
		{
			borderWidth: 1,
			borderColor: isFocused ? activeBorderColor : passiveBorderColor,
			borderRadius: 6,
			flexDirection: "row",
			alignItems: "center",
			height: inputHeight,
		},
		customInputStyle
	]

	const inputRef = useRef<TextInput>()

	const bgColor = (disabled ? disabledBackgroundColor : backgroundColor)
  return (
    <View style={[styles.container, { backgroundColor: bgColor }, customContainerStyle]}>
      <Animated.View style={{
				position: 'absolute',
				bottom: labelPositionRef,
				left: 10,
				transform: [{
					scale: scaleRef
				}],
				zIndex: zIndexRef,
				height,
			}}>
				<View style={{ top: initialTopValue, position: "relative" }}>
        	<Animated.Text {...animatedTextProps}>{label}</Animated.Text>
        	<View style={{ position: "absolute", width: "100%", backgroundColor: bgColor, height: 3, top: lineHeightValue/2-1, zIndex: 0 }} />
				</View>
      </Animated.View>
			<TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => {
				if(customAction) {
					customAction()
				} else if(!disabled) {
					inputRef.current?.focus()
				}
			}}>
				<View style={inputContainerStyle}>
					<TextInput {...inputProps} {...textInputProps} editable={!disabled && !customAction} ref={inputRef} />
					{(!!textAfterInput && (!!value || isFocused)) && (
						<Text style={{ flex: 0, color: isFocused ? activeValueColor : passiveValueColor }}>{textAfterInput}</Text>
					)}
				</View>
			</TouchableWithoutFeedback>
			{/* <TextInput {...inputProps} {...textInputProps} editable={!disabled} /> */}
    </View>
  );
};

const LabelStyle = ({
  isFocused,
  activeLabelColor,
  passiveLabelColor,
}: LabelStylePropTypes) => ({
  fontStyle: 'normal',
  fontWeight: 'normal',
  color: isFocused ? activeLabelColor : passiveLabelColor,
  paddingRight: 5,
  paddingLeft: 5,
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderRadius: 6,
  },
});

const InputStyle = ({
  padding,
  fontSize,
  isFocused,
  activeValueColor,
  passiveValueColor,
}: InputStyleProps) => ({
  padding,
  fontSize,
  color: isFocused ? activeValueColor : passiveValueColor,
});

export default memo(OutlineInput);
