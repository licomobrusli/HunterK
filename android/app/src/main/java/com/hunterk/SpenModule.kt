package com.hunterk

import android.widget.Toast
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback
import com.samsung.android.sdk.penremote.SpenRemote
import com.samsung.android.sdk.penremote.SpenUnitManager
import com.samsung.android.sdk.penremote.SpenEventListener
import com.samsung.android.sdk.penremote.SpenEvent
import com.samsung.android.sdk.penremote.ButtonEvent
import com.samsung.android.sdk.penremote.AirMotionEvent
import com.samsung.android.sdk.penremote.SpenUnit

class SpenModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var spenRemote: SpenRemote? = null
    private var spenUnitManager: SpenUnitManager? = null
    private var isConnected = false

    init {
        val mainHandler = Handler(Looper.getMainLooper())
        mainHandler.post {
            spenRemote = SpenRemote.getInstance()
        }
    }

    override fun getName(): String {
        return "SpenModule"
    }

    @ReactMethod
    fun connect(successCallback: Callback) {
        spenRemote?.connect(currentActivity, object : SpenRemote.ConnectionResultCallback {
            override fun onSuccess(spenUnitManager: SpenUnitManager) {
                this@SpenModule.spenUnitManager = spenUnitManager
                isConnected = true
                
                // Check if Button feature is enabled
                if (spenRemote?.isFeatureEnabled(SpenRemote.FEATURE_TYPE_BUTTON) == true) {
                    successCallback.invoke("Connected with Button Feature Enabled")
                    listenToButtonEvents()
                } else {
                    successCallback.invoke("Button Feature Not Enabled")
                }
            }

            override fun onFailure(errorCode: Int) {
                successCallback.invoke("Connection failed with error code: $errorCode")
            }
        })
    }


    @ReactMethod
    fun disconnect() {
        spenRemote?.disconnect(currentActivity)
        isConnected = false
    }

    private fun listenToButtonEvents() {
        spenUnitManager?.getUnit(SpenUnit.TYPE_BUTTON)?.let { buttonUnit ->
            spenUnitManager?.registerSpenEventListener(object : SpenEventListener {
                override fun onEvent(event: SpenEvent) {
                    val buttonEvent = ButtonEvent(event)
                    val message = when (buttonEvent.action) {
                        ButtonEvent.ACTION_DOWN -> "Button Pressed"
                        ButtonEvent.ACTION_UP -> "Button Released"
                        else -> "Unknown Action"
                    }
                    Toast.makeText(reactApplicationContext, message, Toast.LENGTH_SHORT).show()
                    Log.d("SpenModule", message)
                }
            }, buttonUnit)
        }
    }

    @ReactMethod
    fun startMotionTracking() {
        spenUnitManager?.getUnit(SpenUnit.TYPE_AIR_MOTION)?.let { motionUnit ->
            spenUnitManager?.registerSpenEventListener(object : SpenEventListener {
                override fun onEvent(event: SpenEvent) {
                    val motionEvent = AirMotionEvent(event)
                    val message = "Motion: ${motionEvent.deltaX}, ${motionEvent.deltaY}"
                    Toast.makeText(reactApplicationContext, message, Toast.LENGTH_SHORT).show()
                    Log.d("SpenModule", message)
                }
            }, motionUnit)
        }
    }
}
