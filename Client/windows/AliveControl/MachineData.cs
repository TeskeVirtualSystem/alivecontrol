using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AliveControl
{
    public class MachineData
    {
        public String Name = "Unknown";
        public String OS = "Unknown";
        public String Processor = "Unknown";
        public String UUID = null;
        public String UpTime = "Unknown";

        public ulong TotalMemory = 0;
        public ulong FreeMemory = 0;
        public ulong TotalSwap = 0;
        public ulong FreeSwap = 0;

        public Ethernet[] ethernets = new Ethernet[0];
        public MountPoint[] mounts = new MountPoint[0];
        public Smart[] disks = new Smart[0];
        public PCIDevice[] devices = new PCIDevice[0];
        public VirtualMachine[] vms = new VirtualMachine[0];
        public MySQL[] mysqls = new MySQL[0];
        public DRBD drbd = new DRBD();

        public JObject ToACData()
        {
            JObject data = new JObject();

            if (UUID != null)
                data["machineuuid"] = UUID;
            data["name"] = Name;
            data["processor"] = Processor;
            data["total_memory"] = TotalMemory;
            data["free_memory"] = FreeMemory;
            data["total_swap"] = TotalSwap;
            data["free_swap"] = FreeSwap;
            data["uptime"] = UpTime;
            data["os"] = OS;

            data["vms"] = new JArray();
            data["devices"] = new JArray();
            data["ethernets"] = new JArray();
            data["mounts"] = new JArray();
            data["disks"] = new JArray();

            if(drbd != null)
                data["drbds"] = drbd.GetACObj();

            if(ethernets != null)
                foreach (var i in ethernets)
                    ((JArray)data["ethernets"]).Add(i.GetACObj());

            if(devices != null)
                foreach (var i in devices)
                    ((JArray)data["devices"]).Add(i.GetACObj());

            if(vms != null)
                foreach (var i in vms)
                    ((JArray)data["vms"]).Add(i.GetACObj());
            
            if(mounts != null)
                foreach (var i in mounts)
                    ((JArray)data["mounts"]).Add(i.GetACObj());

            if(disks != null)
                foreach (var i in disks)
                    ((JArray)data["disks"]).Add(i.GetACObj());

            return data;
        }

        public String ToJSON()
        {
            JObject data = ToACData();
            return data.ToString();
        }
    }
}
