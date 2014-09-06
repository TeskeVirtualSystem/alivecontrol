using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AliveControl
{
    public class Ethernet
    {
        String Name;
        String IP;
        String Broadcast = "Not Applicable";
        String Mask;
        long RXBytes;
        long TXBytes;

        public Ethernet()
        {
            RXBytes = 0;
            TXBytes = 0;
            Mask = "255.255.255.255";
            IP = "0.0.0.0";
            Name = "Unknown";
        }

        public Ethernet(String Name, String IP, String Mask, long RXBytes, long TXBytes)
        {
            this.Name = Name;
            this.IP = IP;
            this.Mask = Mask;
            this.RXBytes = RXBytes;
            this.TXBytes = TXBytes;
        }

        public override String ToString()
        {
            String output = "";
            output += "IFace: " + Name + "\r\n";
            output += "\tIP: " + IP + "\r\n";
            output += "\tNetmask: " + Mask + "\r\n";
            output += "\tRX Bytes: " + RXBytes + "\r\n";
            output += "\tTX Bytes: " + TXBytes + "\r\n";
            return output;
        }

        public JObject GetACObj()
        {
            JObject obj = new JObject();
            obj["iface"] = Name;
            obj["address"] = IP;
            obj["broadcast"] = Broadcast;
            obj["netmask"] = Mask;
            obj["rxbytes"] = RXBytes;
            obj["txbytes"] = TXBytes;
            return obj;
        }
    }
}
