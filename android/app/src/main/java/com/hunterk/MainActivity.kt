package com.hunterk

import android.app.Activity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import com.samsung.android.sdk.penremote.AirMotionEvent
import com.samsung.android.sdk.penremote.ButtonEvent
import com.samsung.android.sdk.penremote.SpenEvent
import com.samsung.android.sdk.penremote.SpenEventListener
import com.samsung.android.sdk.penremote.SpenRemote
import com.samsung.android.sdk.penremote.SpenUnit
import com.samsung.android.sdk.penremote.SpenUnitManager

class MainActivity : Activity() {
    companion object {
        private const val TAG = "SpenRemoteSample"
    }

    private lateinit var mButtonState: TextView
    private lateinit var mAirMotion: TextView
    private lateinit var mConnectButton: Button
    private lateinit var mMotionButton: Button

    private lateinit var mSpenRemote: SpenRemote
    private lateinit var mSpenUnitManager: SpenUnitManager
    private var mIsMotionListening = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Bind UI elements
        mButtonState = findViewById(R.id.button_state)
        mAirMotion = findViewById(R.id.air_motion)
        mConnectButton = findViewById(R.id.connect_button)
        mMotionButton = findViewById(R.id.motion_button)

        // Initialize SpenRemote instance
        mSpenRemote = SpenRemote.getInstance()
        mSpenRemote.setConnectionStateChangeListener { state ->
            val stateMessage = when (state) {
                SpenRemote.State.CONNECTED -> "Connected"
                SpenRemote.State.DISCONNECTED -> "Disconnected"
                SpenRemote.State.CONNECTING -> "Connecting"
                SpenRemote.State.DISCONNECTING -> "Disconnecting"
                else -> "Unknown State: $state"
            }
            Toast.makeText(this, "Connection State = $stateMessage", Toast.LENGTH_SHORT).show()
            Log.d(TAG, "Connection State Changed: $stateMessage")
        }

        checkSdkInfo()

        // Set up connection button
        mConnectButton.setOnClickListener {
            if (!mSpenRemote.isConnected) {
                connectToSpenRemote()
                mConnectButton.text = "Disconnect"
            } else {
                disconnectSpenRemote()
                mConnectButton.text = "Connect"
                mMotionButton.text = "Start - Motion"
            }
        }

        // Set up motion button
        mMotionButton.setOnClickListener {
            if (!mSpenRemote.isConnected) {
                Log.e(TAG, "S Pen not connected!")
                Toast.makeText(this, "S Pen not connected!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val airMotionUnit = mSpenUnitManager.getUnit(SpenUnit.TYPE_AIR_MOTION)
            if (!mIsMotionListening) {
                mSpenUnitManager.registerSpenEventListener(mAirMotionEventListener, airMotionUnit)
                mMotionButton.text = "Stop - Motion"
                Toast.makeText(this, "Air Motion Tracking Started", Toast.LENGTH_SHORT).show()
                Log.d(TAG, "Air Motion Tracking Started")
            } else {
                mSpenUnitManager.unregisterSpenEventListener(airMotionUnit)
                mMotionButton.text = "Start - Motion"
                Toast.makeText(this, "Air Motion Tracking Stopped", Toast.LENGTH_SHORT).show()
                Log.d(TAG, "Air Motion Tracking Stopped")
            }
            mIsMotionListening = !mIsMotionListening
        }
    }

    private fun checkSdkInfo() {
        Log.d(TAG, "VersionCode=${mSpenRemote.versionCode}")
        Log.d(TAG, "VersionName=${mSpenRemote.versionName}")
        Log.d(TAG, "Support Button = ${mSpenRemote.isFeatureEnabled(SpenRemote.FEATURE_TYPE_BUTTON)}")
        Log.d(TAG, "Support Air Motion = ${mSpenRemote.isFeatureEnabled(SpenRemote.FEATURE_TYPE_AIR_MOTION)}")
    }

    override fun onResume() {
        super.onResume()
    }

    override fun onStop() {
        super.onStop()
        if (mSpenRemote.isConnected) {
            disconnectSpenRemote()
        }
    }

    private fun connectToSpenRemote() {
        if (mSpenRemote.isConnected) {
            Log.d(TAG, "Already Connected!")
            Toast.makeText(this, "Already Connected.", Toast.LENGTH_SHORT).show()
            return
        }

        Log.d(TAG, "Connecting to S Pen Remote")
        Toast.makeText(this, "Connecting to S Pen Remote...", Toast.LENGTH_SHORT).show()

        mSpenRemote.connect(this, mConnectionResultCallback)
        mIsMotionListening = false
    }

    private fun disconnectSpenRemote() {
        if (mSpenRemote.isConnected) {
            mSpenRemote.disconnect(this)
            Toast.makeText(this, "Disconnected from S Pen", Toast.LENGTH_SHORT).show()
            Log.d(TAG, "Disconnected from S Pen")
        }
    }

    private val mConnectionResultCallback = object : SpenRemote.ConnectionResultCallback {
        override fun onSuccess(spenUnitManager: SpenUnitManager) {
            Log.d(TAG, "Successfully Connected to S Pen")
            Toast.makeText(this@MainActivity, "Connected", Toast.LENGTH_SHORT).show()
            mSpenUnitManager = spenUnitManager

            val buttonUnit = mSpenUnitManager.getUnit(SpenUnit.TYPE_BUTTON)
            mSpenUnitManager.registerSpenEventListener(mButtonEventListener, buttonUnit)
            Log.d(TAG, "Button Event Listener Registered")
        }

        override fun onFailure(errorCode: Int) {
            Log.d(TAG, "Connection Failed with error code: $errorCode")
            Toast.makeText(this@MainActivity, "Failed to Connect", Toast.LENGTH_SHORT).show()
        }
    }

    private val mButtonEventListener = SpenEventListener { event ->
        val buttonEvent = ButtonEvent(event)
        when (buttonEvent.action) {
            ButtonEvent.ACTION_DOWN -> {
                runOnUiThread {
                    mButtonState.text = "BUTTON: Pressed"
                }
                Log.d(TAG, "S Pen Button Pressed")
                Toast.makeText(this, "Button Pressed", Toast.LENGTH_SHORT).show()
            }
            ButtonEvent.ACTION_UP -> {
                runOnUiThread {
                    mButtonState.text = "BUTTON: Released"
                }
                Log.d(TAG, "S Pen Button Released")
                Toast.makeText(this, "Button Released", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private val mAirMotionEventListener = SpenEventListener { event ->
        val airMotionEvent = AirMotionEvent(event)
        val deltaX = airMotionEvent.deltaX
        val deltaY = airMotionEvent.deltaY
        runOnUiThread {
            mAirMotion.text = "X: $deltaX, Y: $deltaY"
        }
        Log.d(TAG, "Air Motion detected - X: $deltaX, Y: $deltaY")
        Toast.makeText(this, "Air Motion - X: $deltaX, Y: $deltaY", Toast.LENGTH_SHORT).show()
    }
}
