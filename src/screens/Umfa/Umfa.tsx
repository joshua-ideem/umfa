import { UMFAClient } from '@ideem/zsm-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/theme';

import { AssetByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

function Example() {
  const { t } = useTranslation();

  const {
    // backgrounds,
    // changeTheme,
    // colors,
    // components,
    fonts,
    gutters,
    layout,
    // variant,
  } = useTheme();

  return (
    <SafeScreen>
      <ScrollView scrollEnabled={false}>
        <View
          style={[
            layout.justifyCenter,
            layout.itemsCenter,
            gutters.marginTop_32,
          ]}
        >
          <View style={[layout.relative]} />

          <View
            style={[
              layout.absolute,
              gutters.paddingTop_12,
              {
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 50,
                width: 200,
                height: 200,
                overflow: 'hidden',
              },
            ]}
          >
            <AssetByVariant
              path={'logo-ideem'}
              resizeMode={'contain'}
              style={{ height: 100, width: 100, marginRight: 8 }}
            />
            <AssetByVariant
              path={'logo-zsm'}
              resizeMode={'contain'}
              style={{ height: 50, width: 50 }}
            />
          </View>
        </View>

        <View style={[gutters.marginTop_24]}>
          <View style={[gutters.paddingHorizontal_32, gutters.marginTop_16]}>
            <Text style={[fonts.size_32, fonts.gray800, fonts.bold]}>
              {t('screen_example.title')}
            </Text>
          </View>

          <EmailForm />

          <View style={[gutters.marginTop_16, gutters.paddingHorizontal_32]}>
            <Text
              style={[fonts.size_12, fonts.gray200, gutters.marginBottom_40]}
            >
              {t('screen_example.description')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

export default Example;

const EmailForm = () => {
  const { components, fonts, gutters, layout, colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const email = `test-${Math.floor(Math.random() * 100000000)}@useideem.com`;

  const config = useMemo(
    () => ({
      application_id: 'a1f4769a-a4be-45f9-91af-f3568f054be9',
      host_url: 'https://zsm-authenticator-demo.useideem.com/',
      application_environment: 'TEST',
      api_key: '33214443-c760-4f8e-924e-9a2ad5cb0bf6',
      consumer_id: email,
    }),
    [email],
  );

  const client = useMemo(() => new UMFAClient(config), [config]);

  // Initialize React Hook Form
  const {
    control,
    // handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<{ email: string }>();
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isTextInputEmpty, setIsTextInputEmpty] = useState(true);
  const [messages, setMessages] = useState<{ text: string; time: string }[]>(
    [],
  );

  const watchedEmail = watch('email', email);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    setIsEmailValid(validateEmail(watchedEmail));
    setIsTextInputEmpty(watchedEmail === '');
  }, [watchedEmail]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const isButtonDisabled = isTextInputEmpty || !isEmailValid;
  const currentTime = new Date().toLocaleTimeString();
  const emailValue = getValues('email');

  const handleCheckEnrollment = () => {
    client
      .checkEnrollment(emailValue)
      .then((isEnrolled: boolean) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text:
              emailValue + (isEnrolled ? ' is enrolled' : ' is not enrolled.'),
            time: currentTime,
          },
        ]);
      })
      .catch((error: any) => {
        console.error('Error checking enrollment:', error.message);
      });
  };

  const handleEnroll = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: 'Attempting to enroll ' + emailValue + '...', time: currentTime },
    ]);

    client
      .enroll(emailValue)
      .then((token: string) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: token
              ? `${emailValue} enrolled with token: ${token.slice(0, 3)}...${token.slice(-3)}`
              : `${emailValue} is already enrolled!`,
            time: currentTime,
          },
        ]);
      })
      .catch((error: any) => {
        console.error('Error during enrollment:', error.message);
      });
  };

  const handleAuthenticate = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: 'Attempting to authenticate ' + emailValue + '...',
        time: currentTime,
      },
    ]);

    client
      .authenticate(emailValue)
      .then((result: { token: string }) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: result.token
              ? `${emailValue} was authenticated with token: ${result.token.slice(0, 3)}...${result.token.slice(-3)}`
              : `ERROR: Unable to authenticate user: ${emailValue} is not enrolled.`,
            time: result.token ? currentTime : '',
          },
        ]);
      })
      .catch((error: any) => {
        console.error('Error during authentication:', error.message);
      });
  };

  const handleValidate = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: 'Attempting to validate ' + emailValue + `'s token ` + '...',
        time: currentTime,
      },
    ]);

    // setMessages((prevMessages) => [
    //   ...prevMessages,
    //   {
    //     text: emailValue + `'s token ` + ' is invalid',
    //     time: currentTime,
    //   },
    // ]);
  };

  const handleResetDevice = () => {
    client
      .resetDevice()
      .then(() => {
        setMessages(() => [
          { text: 'Transcript cleared.', time: currentTime },
          { text: 'Device reset.', time: currentTime },
        ]);
      })
      .catch((error: any) => {
        console.error('Error resetting the device:', error.message);
      });
  };

  const handleClearPress = () => {
    setMessages([{ text: 'Transcript cleared.', time: currentTime }]);
  };

  return (
    <View style={styles.container}>
      <View style={[gutters.paddingHorizontal_32]}>
        <Text style={[fonts.size_16, gutters.marginVertical_12]}>
          {'Email Address:'}
        </Text>

        {/* Email Input Field */}
        <Controller
          name="email"
          control={control}
          defaultValue={email}
          rules={{
            required: 'Email is required',
            validate: (value) =>
              validateEmail(value) || 'Invalid email address',
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.errorInput]}
              placeholder="Enter your email"
              value={value}
              onChangeText={(text) => {
                onChange(text);
                setValue('email', text);
                trigger('email');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
      </View>

      <View style={[layout.row, layout.justifyBetween, gutters.padding_16]}>
        <TouchableOpacity
          onPress={handleCheckEnrollment}
          style={[
            components.button,
            isButtonDisabled && { backgroundColor: '#878787' },
            gutters.marginBottom_16,
          ]}
          disabled={isButtonDisabled}
        >
          <Text style={[fonts.size_12, fonts.white, { textAlign: 'center' }]}>
            {'Check\nEnrollment'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleEnroll}
          style={[
            components.button,
            isButtonDisabled && { backgroundColor: '#878787' },
            gutters.marginBottom_16,
          ]}
          disabled={isButtonDisabled}
        >
          <Text style={[fonts.size_12, fonts.white, { textAlign: 'center' }]}>
            {'Enroll'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAuthenticate}
          style={[
            components.button,
            isButtonDisabled && { backgroundColor: '#878787' },
          ]}
          disabled={isButtonDisabled}
        >
          <Text style={[fonts.white, { textAlign: 'center', fontSize: 10 }]}>
            {'Authenticate'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleValidate}
          style={[
            components.button,
            isButtonDisabled && { backgroundColor: '#878787' },
            gutters.marginBottom_16,
          ]}
          disabled={isButtonDisabled}
        >
          <Text style={[fonts.size_12, fonts.white, { textAlign: 'center' }]}>
            {'Validate\nToken'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResetDevice}
          style={[
            components.button,
            isButtonDisabled && { backgroundColor: '#878787' },
            gutters.marginBottom_16,
          ]}
          disabled={isButtonDisabled}
        >
          <Text style={[fonts.size_12, fonts.white, { textAlign: 'center' }]}>
            {'Reset\nDevice'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[gutters.paddingHorizontal_32]}>
        <View
          style={[
            layout.row,
            layout.justifyBetween,
            layout.fullWidth,
            layout.itemsCenter,
          ]}
        >
          <Text style={[fonts.size_24]}>{'Demo Transcript'}</Text>

          <TouchableOpacity
            onPress={handleClearPress}
            style={[
              components.button,
              { backgroundColor: colors.sandybrown, height: 30, width: 70 },
            ]}
          >
            <Text style={[fonts.size_16]}>{'Clear'}</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.listContainer,
            gutters.padding_12,
            gutters.marginVertical_12,
            { height: 350 },
          ]}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 50 }}
            renderItem={({ item }) => (
              <View
                style={[
                  layout.row,
                  gutters.paddingTop_12,
                  { flexWrap: 'nowrap' },
                ]}
              >
                <Text
                  style={[
                    fonts.size_16,
                    fonts.gray400,
                    gutters.marginRight_12,
                    { flexShrink: 0 },
                  ]}
                >
                  {item.time}
                </Text>
                <Text style={[fonts.size_16, { flexShrink: 1 }]}>
                  {item.text}
                </Text>
              </View>
            )}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: 1,
                  backgroundColor: '#ccc',
                  marginVertical: 8,
                }}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  errorInput: {
    borderColor: 'red',
  },
  listContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
});
