﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
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
            ComputerInfo x = new ComputerInfo();
            textBox1.Text += "\r\n" + x.OSFullName;
            textBox1.Text += "\r\n" + x.TotalPhysicalMemory;
            textBox1.Text += "\r\n" + tvstools.GetProcessorName();
            //Smart[] smarts = tvstools.ReadSmart();
            //foreach (Smart smart in smarts)
            //{
            //    textBox1.Text += smart.ToString();
            //}
        }
    }
}
