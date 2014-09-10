using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Win32;

namespace AliveControl
{
    public class RegMan
    {
        public static string ProgramBase = "AliveControl";
        public static void SetProgramBase(string basename)
        {
            ProgramBase = basename;
        }
        public static bool Write(string KeyName, object Value)
        {
            try
            {
                RegistryKey rk = Registry.LocalMachine;
                RegistryKey sk1 = Registry.LocalMachine.CreateSubKey("SOFTWARE\\Teske Virtual System\\" + ProgramBase, RegistryKeyPermissionCheck.ReadWriteSubTree);
                sk1.SetValue(KeyName.ToUpper(), Value);
                return true;
            }
            catch (Exception e)
            {
                LogMan.AddLog("Error writting registry " + KeyName.ToUpper() + " : " + e.ToString());
                return false;
            }
        }

        public static string Read(string KeyName)
        {
            // Opening the registry key
            RegistryKey rk = Registry.LocalMachine;
            // Open a subKey as read-only
            RegistryKey sk1 = rk.OpenSubKey("SOFTWARE\\Teske Virtual System\\" + ProgramBase);
            // If the RegistrySubKey doesn't exist -> (null)
            if (sk1 == null)
            {
                return null;
            }
            else
            {
                try
                {
                    // If the RegistryKey exists I get its value
                    // or null is returned.
                    return (string)sk1.GetValue(KeyName.ToUpper());
                }
                catch (Exception e)
                {
                    LogMan.AddLog("Error Reading registry " + KeyName.ToUpper() + " : " + e.ToString());
                    return null;
                }
            }
        }
    }
}
