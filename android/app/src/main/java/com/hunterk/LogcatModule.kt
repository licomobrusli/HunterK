// LogcatModule.kt

package com.hunterk

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.BufferedReader
import java.io.InputStreamReader

class LogcatModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var logcatProcess: Process? = null

    override fun getName(): String {
        return "LogcatModule"
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        Log.d("LogcatModule", "startListening called")
        if (logcatProcess != null) {
            Log.d("LogcatModule", "Already listening")
            promise.resolve("Already listening")
            return
        }

        try {
            // Clear the logcat buffer to avoid processing old logs
            Runtime.getRuntime().exec("logcat -c")
            Log.d("LogcatModule", "Cleared logcat buffer")
        } catch (e: Exception) {
            Log.e("LogcatModule", "Failed to clear logcat buffer", e)
            promise.reject("ERROR_CLEARING_LOGCAT", e)
            return
        }

        Thread {
            try {
                Log.d("LogcatModule", "Starting logcat listener thread")
                logcatProcess = Runtime.getRuntime().exec("logcat -v time")
                val bufferedReader = BufferedReader(InputStreamReader(logcatProcess!!.inputStream))

                var logLine: String? = null // Initialized to null

                while (logcatProcess != null && bufferedReader.readLine().also { logLine = it } != null) {
                    logLine?.let { log ->
                        // Emit events with timestamps
                        when {
                            log.contains("onButtonEvent : button clicked = PRIMARY") -> {
                                sendEventToReactNative("single_press", System.currentTimeMillis())
                            }
                            log.contains("onButtonEvent : button long clicked = PRIMARY") -> {
                                sendEventToReactNative("long_press", System.currentTimeMillis())
                            }
                            log.contains("onButtonEvent : button double clicked = PRIMARY") -> {
                                sendEventToReactNative("double_press", System.currentTimeMillis())
                            }
                        }
                    }
                }
                Log.d("LogcatModule", "Logcat listener thread exiting")
            } catch (e: Exception) {
                Log.e("LogcatModule", "Error reading logcat", e)
            } finally {
                logcatProcess = null
            }
        }.start()

        Log.d("LogcatModule", "Started logcat listener thread")
        promise.resolve("Listening to Logcat logs")
    }

    // Optionally, remove stopListening or make it a no-op
    @ReactMethod
    fun stopListening(promise: Promise) {
        Log.d("LogcatModule", "stopListening called")
        promise.resolve("Stop listening is now a no-op")
    }

    private fun sendEventToReactNative(eventName: String, timestamp: Long) {
        val params = Arguments.createMap()
        params.putString("eventName", eventName)
        params.putDouble("timestamp", timestamp.toDouble())
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("LogcatEvent", params)
        Log.d("LogcatModule", "Emitted event: $eventName at $timestamp")
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
