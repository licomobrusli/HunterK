package com.hunterk

import android.app.Activity
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import com.samsung.android.sdk.penremote.ButtonEvent
import com.samsung.android.sdk.penremote.SpenEvent
import com.samsung.android.sdk.penremote.SpenEventListener
import com.samsung.android.sdk.penremote.SpenRemote
import com.samsung.android.sdk.penremote.SpenUnitManager

class MainActivity : Activity() {
    private val TAG = "HunterkSpenRemote"
    private lateinit var spenRemote: SpenRemote
    private var spenUnitManager: SpenUnitManager? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize SpenRemote
        spenRemote = SpenRemote.getInstance()
        spenRemote.setConnectionStateChangeListener { state ->
            Toast.makeText(this, "Connection State = $state", Toast.LENGTH_SHORT).show()
            if (state == SpenRemote.State.CONNECTED) {
                registerButtonEventListener()
            }
        }

        // Attempt to connect to SpenRemote on startup
        connectToSpenRemote()
    }

    private fun connectToSpenRemote() {
        if (spenRemote.isConnected) {
            Toast.makeText(this, "Already Connected.", Toast.LENGTH_SHORT).show()
            return
        }

        spenRemote.connect(this, object : SpenRemote.ConnectionResultCallback {
            override fun onSuccess(unitManager: SpenUnitManager) {
                spenUnitManager = unitManager
                Toast.makeText(this@MainActivity, "Connected to S Pen", Toast.LENGTH_SHORT).show()
            }

            override fun onFailure(error: Int) {
                Toast.makeText(this@MainActivity, "Connection Failed: $error", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun registerButtonEventListener() {
        spenUnitManager?.getUnit(SpenUnit.TYPE_BUTTON)?.let { buttonUnit ->
            spenUnitManager?.registerSpenEventListener(buttonEventListener, buttonUnit)
        }
    }

    private val buttonEventListener = SpenEventListener { event ->
        val buttonEvent = ButtonEvent(event)
        when (buttonEvent.action) {
            ButtonEvent.ACTION_DOWN -> Log.d(TAG, "S Pen Button Pressed")
            ButtonEvent.ACTION_UP -> Log.d(TAG, "S Pen Button Released")
        }
    }

    override fun onStop() {
        super.onStop()
        spenRemote.disconnect(this)
    }
}
