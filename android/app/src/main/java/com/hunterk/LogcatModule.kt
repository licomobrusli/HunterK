package com.hunterk

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.BufferedReader
import java.io.InputStreamReader

class LogcatModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var isListening = false

    override fun getName(): String {
        return "LogcatModule"
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        if (isListening) {
            promise.resolve("Already listening")
            return
        }

        isListening = true

        Thread {
            try {
                Log.d("LogcatModule", "Starting logcat listener")
                val process = Runtime.getRuntime().exec("logcat")
                val bufferedReader = BufferedReader(InputStreamReader(process.inputStream))

                var logLine: String? = null  // Initialize the variable here

                while (isListening && bufferedReader.readLine().also { logLine = it } != null) {
                    logLine?.let { log ->
                        // Filter logs to detect S Pen button actions
                        if (log.contains("onButtonEvent : button clicked = PRIMARY")) {
                            sendEventToReactNative("single_press")
                        } else if (log.contains("onButtonEvent : button long clicked = PRIMARY")) {
                            sendEventToReactNative("long_press")
                        } else if (log.contains("onButtonEvent : button double clicked = PRIMARY")) {
                            sendEventToReactNative("double_press")
                        }
                        // Optionally, log all lines for debugging
                        // Log.d("LogcatModule", log)
                    }
                }
                Log.d("LogcatModule", "Logcat listener stopped")
            } catch (e: Exception) {
                Log.e("LogcatModule", "Error reading logcat", e)
                promise.reject("ERROR_READING_LOGS", e)
            }
        }.start()

        promise.resolve("Listening to Logcat logs")
    }

    @ReactMethod
    fun stopListening() {
        isListening = false
    }

    private fun sendEventToReactNative(eventName: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("LogcatEvent", eventName)
    }

    // Required for NativeEventEmitter
    @ReactMethod
    fun addListener(eventName: String) {
        // No-op
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // No-op
    }
}
