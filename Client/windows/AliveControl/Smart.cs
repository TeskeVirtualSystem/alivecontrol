using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

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

        public Smart(String Device, String Family, long Capacity, long PowerOnCycles, long ReadErrors, long RealocatedSectors, String Status)
        {
            this.Device = Device;
            this.Family = Family;
            this.Capacity = Capacity;
            this.PowerOnCycles = PowerOnCycles;
            this.ReadErrors = ReadErrors;
            this.RealocatedSectors = RealocatedSectors;
            this.Status = Status;
        }


        public override string ToString()
        {
            String output = "";
            output += "Device: " + Device + "\r\n";
            output += "\tFamily: " + Family + "\r\n";
            output += "\tCapacty: " + Capacity + "\r\n";
            output += "\tReadErrors: " + ReadErrors + "\r\n";
            output += "\tRealocated Sectors: " + RealocatedSectors + "\r\n";
            output += "\tStatus: " + Status + "\r\n";

            return output;
        }
    }
}
