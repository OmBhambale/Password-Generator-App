import { Tabs } from 'expo-router'
import React from 'react'
import { Colors } from '../../lib/theme'

const _layouts = () => {
  return (
   <Tabs>
      <Tabs.Screen
          name='index'
          options={{
            title:'QuickCrypt',
            headerShown: true,
            headerStyle:{
              backgroundColor: Colors.secondary
            },
            headerTitleStyle:{
              fontSize:20, 
              fontWeight:'800',
              color:'#FFF'
            }
          }}
      />
      <Tabs.Screen
          name='storedPasswords'
          options={{
            title:'Your Passwords',
            headerShown: true,
            headerStyle:{
              backgroundColor: Colors.secondary
            },
            headerTitleStyle:{
              fontSize:20, 
              fontWeight:'800',
              color:'#FFF'
            }
          }}
      />
      <Tabs.Screen
          name='profile'
          options={{
            title:'My Account',
            headerShown: true,
            headerStyle:{
              backgroundColor: Colors.secondary
            },
            headerTitleStyle:{
              fontSize:20, 
              fontWeight:'800',
              color:'#FFF'
            }
          }}
      />
   </Tabs>
  )
}

export default _layouts