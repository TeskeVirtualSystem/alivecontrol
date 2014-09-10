using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Management;
using System.Net;
using System.Net.Sockets;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;
using AliveControl;
using System.IO;
using Microsoft.VisualBasic.Devices;

namespace TestBench
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        [StructLayout(LayoutKind.Sequential)]
        public struct Attribute
        {
            public byte AttributeID;
            public ushort Flags;
            public byte Value;
            [MarshalAs(UnmanagedType.ByValArray, SizeConst = 8)]
            public byte[] VendorData;
        }

        private void button1_Click(object sender, EventArgs e)
        {
            MachineData mdata = new MachineData(); 
            Name = tvstools.GetMachineName();
            mdata.disks = tvstools.ReadSmart();
            mdata.ethernets = tvstools.GetNetworkDevices();
            mdata.mounts = tvstools.GetMountPoints();
            mdata.UpTime = tvstools.GetUpTime();
            mdata.Processor = tvstools.GetProcessorName();
            mdata.OS = tvstools.GetOSName();
            mdata.FreeMemory = tvstools.GetFreeMemory();
            mdata.FreeSwap = tvstools.GetFreeSwapMemory();
            mdata.TotalMemory = tvstools.GetTotalMemory();
            mdata.TotalSwap = tvstools.GetTotalSwapMemory();
            mdata.Name = Name;

            //API.SessionKey = "f42a8580-24b7-11e4-b30f-3b79ab91660d";
            //textBox1.Text += "\r\n" + API._CallAPI("loadmachines", null);

            textBox1.Text += "\r\n" + mdata.ToJSON();
            //Smart[] smarts = tvstools.ReadSmart();
            //foreach (Smart smart in smarts)
            //{
            //    textBox1.Text += smart.ToString();
            //}
        }
    }
}
