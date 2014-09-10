using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;


namespace AliveControl
{
    public class LogMan
    {
        public static string LogDirectory = "C:\\temp";
        public static Boolean debugmode = false;
        public static StreamWriter sw;
        public static StreamWriter swDebug;
        public static string basename = "standalone";
        static LogMan()
        {

        }
        public static void StartLogging(string path, string name)
        {
            try
            {
                Directory.CreateDirectory(path);
            }
            catch (Exception) { }
            LogDirectory = path;
            basename = name;
            // if the file doesn't exist, create it
            if (!File.Exists(LogDirectory + "\\" + String.Format("{0:ddMMyyyy}", DateTime.Today) + "-" + basename + ".log"))
            {
                FileStream fs = File.Create(LogDirectory + "\\" + String.Format("{0:ddMMyyyy}", DateTime.Today) + "-" + basename + ".log");
                fs.Close();
            }
            if (!File.Exists(LogDirectory + "\\" + String.Format("{0:ddMMyyyy}", DateTime.Today) + "-" + basename + "_debug.log"))
            {
                FileStream fs = File.Create(LogDirectory + "\\" + String.Format("{0:ddMMyyyy}", DateTime.Today) + "-" + basename + "_debug.log");
                fs.Close();
            }
            // open up the streamwriter for writing..
            sw = File.AppendText(LogDirectory + "\\" + String.Format("{0:ddMMyyyy}", DateTime.Today) + "-" + basename + ".log");
            swDebug = File.AppendText(LogDirectory + "\\" + String.Format("{0:ddMMyyyy}", DateTime.Today) + "-" + basename + "_debug.log");
        }
        public static void AddLog(string text)
        {
            try
            {
                lock (sw)
                {
                    sw.WriteLine(DateTime.Now + ": " + text);
                    sw.Flush();
                }
            }
            catch
            {
            }
        }
        public static void AddDebug(string text)
        {
            if (debugmode)
                try
                {
                    lock (swDebug)
                    {
                        swDebug.WriteLine(DateTime.Now + ": " + text);
                        swDebug.Flush();
                    }
                }
                catch
                {
                }
        }
    }
}
