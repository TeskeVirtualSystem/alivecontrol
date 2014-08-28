using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AliveControl
{
    public class MachineData
    {
        public String Name;
        public String OS;
        public String Processor;

        public ulong TotalMemory;
        public ulong FreeMemory;
        public ulong TotalSwap;
        public ulong FreeSwap;

        public Ethernet[] ethernets;
        public MountPoint[] mounts;
        public Smart[] disks;
        public PCIDevice[] devices;
        public VirtualMachine[] vms;
        public MySQL[] mysqls;
        public DRBD drbd;

    }
}
