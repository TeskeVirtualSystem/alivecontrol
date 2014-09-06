using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Management;
using System.Net;
using System.Net.Sockets;
using System.Net.NetworkInformation;
using System.IO;
using Microsoft.VisualBasic.Devices;
using System.Diagnostics;

namespace AliveControl
{
    public class tvstools
    {
        public static TimeSpan UpTime
        {
            get
            {
                using (var uptime = new PerformanceCounter("System", "System Up Time"))
                {
                    uptime.NextValue();       //Call this an extra time before reading its value
                    return TimeSpan.FromSeconds(uptime.NextValue());
                }
            }
        }

        public static String GetUpTime()
        {
            return UpTime.Days.ToString() + " days " + UpTime.Hours + " hours " + UpTime.Minutes + " minutes " + UpTime.Seconds + " seconds";
        }
        public static String GetOSName()
        {
            /*
            var name = (from x in new ManagementObjectSearcher("SELECT * FROM Win32_OperatingSystem").Get().OfType<ManagementObject>()
                        select x.GetPropertyValue("Caption")).FirstOrDefault();*/

            ComputerInfo x = new ComputerInfo();
            var name = x.OSFullName;
            var x64 = (Environment.Is64BitOperatingSystem) ? "(x86_64)" : "(x84)";

            return (name != null ? name.ToString() : "Windows") + " " + x64.ToString();
        }

        public static String GetProcessorName()
        {
            String output = "";
            ManagementObjectSearcher mos =  new ManagementObjectSearcher("root\\CIMV2", "SELECT * FROM Win32_Processor");
            foreach (ManagementObject mo in mos.Get())
            {
                output = mo["Name"].ToString() ;
                break;
            }

            return output;
        }
        public static ulong GetTotalMemory()
        {
            return new ComputerInfo().TotalPhysicalMemory;
        }

        public static ulong GetFreeMemory()
        {
            return new ComputerInfo().AvailablePhysicalMemory;
        }

        public static ulong GetTotalSwapMemory()
        {
            return new ComputerInfo().TotalVirtualMemory;
        }

        public static ulong GetFreeSwapMemory()
        {
            return new ComputerInfo().AvailableVirtualMemory;
        }

        public static Ethernet[] GetNetworkDevices()
        {
            NetworkInterface[] ifaces = NetworkInterface.GetAllNetworkInterfaces();
            Ethernet[] ethernets = new Ethernet[ifaces.Length];
            int count = 0;
            foreach(NetworkInterface iface in ifaces) {
                String ip = "0.0.0.0";
                String mask = "255.255.255.255";
                IPInterfaceProperties properties = iface.GetIPProperties();
                foreach (UnicastIPAddressInformation unicast in properties.UnicastAddresses)
                    if (unicast.Address.AddressFamily == AddressFamily.InterNetwork) {
                        ip = unicast.Address.ToString();
                        mask = unicast.IPv4Mask.ToString();
                        break;
                    }

                count++;
                ethernets[count] = new Ethernet(iface.Name, ip, mask, iface.GetIPv4Statistics().BytesReceived, iface.GetIPv4Statistics().BytesSent);
            }
            return ethernets;
        }
        public static String GetDeviceName(String PNPID)
        {
            String name = "";
            try
            {
                var query = "SELECT * FROM Win32_DiskDrive WHERE PNPDeviceID = '" + PNPID.Replace("\\", "\\\\") + "'";
                //
                var queryResults = new ManagementObjectSearcher(query);
                var partitions = queryResults.Get();
                foreach (var partition in partitions)
                {
                    if (partition["Caption"] != null)
                        name = partition["Caption"].ToString();
                }
            }
            catch (Exception e)
            {

            }
            return name;
        }

        public static long GetDeviceCapacity(String PNPID)
        {
            long size = 0;
            try
            {
                var query = "SELECT * FROM Win32_DiskDrive WHERE PNPDeviceID = '" + PNPID.Replace("\\", "\\\\") + "'";
                //
                var queryResults = new ManagementObjectSearcher(query);
                var partitions = queryResults.Get();
                foreach (var partition in partitions)
                {
                    if (partition["Caption"] != null)
                        Int64.TryParse(partition["Size"].ToString(), out size);
                }
            }
            catch (Exception e)
            {

            }
            return size;
        }
        public static String GetDevice(String PNPID)
        {
            String name = "";
            try
            {
                var query = "SELECT * FROM Win32_DiskDrive WHERE PNPDeviceID = '" + PNPID.Replace("\\", "\\\\") + "'";
                //
                var queryResults = new ManagementObjectSearcher(query);
                var partitions = queryResults.Get();
                foreach (var partition in partitions)
                {
                    if (partition["Name"] != null)
                        name = partition["Name"].ToString();
                }
            }
            catch (Exception e)
            {

            }
            return name;
        }

        public static String GetMountDevice(String mount)
        {
            String device = "";
            mount = mount.Replace("\\", "");
            try
            {
                var queryResults = new ManagementObjectSearcher("ASSOCIATORS OF {Win32_LogicalDisk.DeviceID='" + mount + "'} WHERE AssocClass = Win32_LogicalDiskToPartition");
                foreach (var partition in queryResults.Get())
                {
                    ;
                    queryResults = new ManagementObjectSearcher("ASSOCIATORS OF {Win32_DiskPartition.DeviceID='" + partition["DeviceID"] + "'} WHERE AssocClass = Win32_DiskDriveToDiskPartition");
                    var drives = queryResults.Get();
                    foreach (var drive in drives)
                        device = drive["PNPDeviceID"].ToString();
                }
            }
            catch (Exception e)
            {

            }
            return device;
        }
        public static MountPoint[] GetMountPoints()
        {
            DriveInfo[] drives = DriveInfo.GetDrives();
            int max = 0;
            foreach (DriveInfo drive in drives)
            {
                if (drive.IsReady && drive.DriveType != DriveType.CDRom)
                {
                    max++;
                }
            }
            MountPoint[] mounts = new MountPoint[max];
            int count = 0;
            foreach (DriveInfo drive in drives)
            {
                if (drive.IsReady && drive.DriveType != DriveType.CDRom)
                {
                    mounts[count] = new MountPoint(drive.Name, GetMountDevice(drive.Name), GetMPUsed(drive), GetMPFree(drive), GetMPSize(drive));
                    count++;
                }
            }
            return mounts;
        }

        private static long GetMPFree(DriveInfo di)
        {
            try
            {
                return di.TotalFreeSpace;
            }
            catch (Exception e)
            {
                return 0;
            }
        }


        private static long GetMPSize(DriveInfo di)
        {
            try
            {
                return di.TotalSize;
            }
            catch (Exception e)
            {
                return 0;
            }
        }

        private static long GetMPUsed(DriveInfo di)
        {
            return GetMPSize(di) - GetMPFree(di);
        }

        public static Smart[] ReadSmart()
        {
            Smart[] smart = null;
            try
            {
                var searcher = new ManagementObjectSearcher("root\\WMI", "SELECT * FROM MSStorageDriver_ATAPISmartData");
                smart = new Smart[searcher.Get().Count];
                int count = 0;
                foreach (ManagementObject queryObj in searcher.Get())
                {
                    String pnpid = queryObj.GetPropertyValue("InstanceName").ToString().ToUpper();
                    int PowerCycleCount = 0;
                    int ReadErrorRate = 0;
                    int RealocatedSectors = 0;
                    int PowerOnHours = 0;

                    pnpid = pnpid.Substring(0, pnpid.Length - 2);


                    var arrVendorSpecific = (byte[])queryObj.GetPropertyValue("VendorSpecific");
                    bool diskOK = true;
                    // Create SMART data from 'vendor specific' array
                    var d = new SmartData(arrVendorSpecific);
                    foreach (var b in d.Attributes)
                    {
                        switch (b.AttributeType)
                        {
                            case SmartAttributeType.PowerOnHoursPOH: PowerOnHours = BitConverter.ToInt32(b.VendorData, 0); break;
                            case SmartAttributeType.ReadErrorRate: ReadErrorRate = BitConverter.ToInt32(b.VendorData, 0); break;
                            case SmartAttributeType.PowerCycleCount: PowerCycleCount = BitConverter.ToInt32(b.VendorData, 0); break;
                            case SmartAttributeType.ReallocatedSectorsCount: RealocatedSectors = BitConverter.ToInt32(b.VendorData, 0); break;
                        }
                        diskOK &= !b.FailureImminent;
                    }
                    smart[count] = new Smart(GetDevice(pnpid), tvstools.GetDeviceName(pnpid), GetDeviceCapacity(pnpid), PowerCycleCount, ReadErrorRate, RealocatedSectors, PowerOnHours, diskOK ? "PASSED" : "FAILED" );
                    count++;
                }
            }
            catch (Exception cn)
            {

            }

            return smart;
        }
    }
}
