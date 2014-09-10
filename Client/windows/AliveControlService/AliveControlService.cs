using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Timers;
using AliveControl;

namespace AliveControlService
{
    public partial class AliveControlService : ServiceBase
    {
        private System.Timers.Timer mTimer;
        private String MachineUUID, SessionKey, Name;
        private int Interval;

        public AliveControlService()
        {
            InitializeComponent();
            string path = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().GetName().CodeBase);
            RegMan.SetProgramBase("AliveControl");
            LogMan.LogDirectory = path.Replace("file:\\", "");
            LogMan.StartLogging(LogMan.LogDirectory, "AliveControl");
            LogMan.AddLog("HUEAHOEIUHAEOIU");
            RegMan.Write("Path", path.Replace("file:\\", ""));
            LogMan.debugmode = true;
        }

        private void LoadConfig()
        {
            if(RegMan.Read("CheckInterval") != null)
                Interval = Int32.Parse(RegMan.Read("CheckInterval"));
            else
                Interval =  60 * 1000;   //  1 Minute

            MachineUUID = RegMan.Read("MachineUUID");
            SessionKey = RegMan.Read("SessionKey");
            Name = RegMan.Read("Name");
            if (Name == null)
                Name = tvstools.GetMachineName();
            API.SessionKey = SessionKey;
        }

        protected override void OnStart(string[] args)
        {
            
            LoadConfig();
            if (SessionKey == null)
            {
                LogMan.AddLog("No session key! Configure with ACConfig"); 
                this.Stop();
                return;
            }
            LogMan.AddLog("Started Service.");
            LogMan.AddLog("Interval: " + Interval.ToString());

            mTimer = new System.Timers.Timer(Interval);
            mTimer.Elapsed += new ElapsedEventHandler(OnTimedEvent);
            mTimer.Enabled = true;
            
        }

        protected override void OnStop()
        {
           mTimer.Stop();
           mTimer.Dispose();
           LogMan.AddLog("Service Stopped");
        }

        private void OnTimedEvent(object source, ElapsedEventArgs e)
        {
            mTimer.Stop();
            MachineData mdata = new MachineData();
            LogMan.AddLog("Fetching Smart");
            mdata.disks = tvstools.ReadSmart();
            GC.KeepAlive(mTimer);
            LogMan.AddLog("Fetching Network Devices");
            mdata.ethernets = tvstools.GetNetworkDevices();
            GC.KeepAlive(mTimer);
            LogMan.AddLog("Fetching Mount Points");
            mdata.mounts = tvstools.GetMountPoints();
            GC.KeepAlive(mTimer);
            mdata.UUID = MachineUUID;
            mdata.UpTime = tvstools.GetUpTime();
            mdata.Processor = tvstools.GetProcessorName();
            mdata.OS = tvstools.GetOSName();
            mdata.FreeMemory = tvstools.GetFreeMemory();
            mdata.FreeSwap = tvstools.GetFreeSwapMemory();
            mdata.TotalMemory = tvstools.GetTotalMemory();
            mdata.TotalSwap = tvstools.GetTotalSwapMemory();
            mdata.Name = Name;
            LogMan.AddDebug(mdata.ToJSON());

            GC.KeepAlive(mTimer);
            LogMan.AddLog("Sending data");
            if (API.SendMachine(mdata))
            {
                if (MachineUUID == null)
                {
                    MachineUUID = API.MachineUUID;
                    LogMan.AddLog("First time of this machine! Now the UUID is: " + MachineUUID);
                    RegMan.Write("MachineUUID", MachineUUID);
                }
                LogMan.AddLog("Data sent successfully!");
            }
            else
            {
                LogMan.AddLog("Fail sending machine data!");
            }
            mTimer.Start();
        }
    }
}
