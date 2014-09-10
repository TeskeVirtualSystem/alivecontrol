using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AliveControl
{
    public class Smart
    {
        String Device;
        String Family;
        long Capacity;
        long TimeOn;
        long PowerOnCycles;
        long ReadErrors;
        long RealocatedSectors;
        String Status;

        public Smart(String Device, String Family, long Capacity, long PowerOnCycles, long ReadErrors, long RealocatedSectors, long TimeOn, String Status)
        {
            this.Device = Device;
            this.Family = Family;
            this.Capacity = Capacity;
            this.PowerOnCycles = PowerOnCycles;
            this.ReadErrors = ReadErrors;
            this.RealocatedSectors = RealocatedSectors;
            this.Status = Status;
            this.TimeOn = TimeOn;
        }


        public override string ToString()
        {
            String output = "";
            output += "Device: " + Device + "\r\n";
            output += "\tFamily: " + Family + "\r\n";
            output += "\tCapacty: " + Capacity + "\r\n";
            output += "\tReadErrors: " + ReadErrors + "\r\n";
            output += "\tRealocated Sectors: " + RealocatedSectors + "\r\n";
            output += "\tPower On Time (hours): " + TimeOn + "\r\n";
            output += "\tStatus: " + Status + "\r\n";

            return output;
        }

        public JObject GetACObj()
        {
            JObject obj = new JObject();
            obj["device"] = Device;
            obj["family"] = Family;
            obj["capacity"] = Capacity;
            obj["diskstatus"] = Status;
            obj["ontime"] = TimeOn;
            obj["readerrors"] = ReadErrors;
            obj["realocatedsectors"] = RealocatedSectors;
            return obj;
        }
    }
}
