using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AliveControl
{
    public class MountPoint
    {
        String Mount;
        String Device;
        long Used;
        long Free;
        long Size;


        public MountPoint(String MP, String Dev, long Used, long Free, long Size)
        {
            this.Mount = MP;
            this.Device = Dev;
            this.Used = Used;
            this.Free = Free;
            this.Size = Size;
        }

        public override String ToString()
        {
            String output = "";
            output += Mount + ":\r\n";
            output += "\tDevice: " + Device + "\r\n";
            output += "\tSize: " + Size + "\r\n";
            output += "\tFree: " + Free + "\r\n";
            output += "\tUsed: " + Used + "\r\n";
            return output;
        }

        public JObject GetACObj()
        {
            JObject obj = new JObject();
            obj["mountpoint"] = Mount;
            obj["device"] = Device;
            obj["used"] = Used;
            obj["free"] = Free;
            obj["size"] = Size;
            return obj;
        }
    }
}
