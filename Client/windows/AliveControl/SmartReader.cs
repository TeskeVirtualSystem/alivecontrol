﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;
using System.Management;

/**
 *  Part of this was from: http://blogs.msdn.com/b/clemensv/archive/2011/04/11/reading-atapi-smart-data-from-drives-using-net-temperature-anyone.aspx
 **/
namespace AliveControl
{
    public enum SmartAttributeType : byte
    {
        ReadErrorRate = 0x01,
        ThroughputPerformance = 0x02,
        SpinUpTime = 0x03,
        StartStopCount = 0x04,
        ReallocatedSectorsCount = 0x05,
        ReadChannelMargin = 0x06,
        SeekErrorRate = 0x07,
        SeekTimePerformance = 0x08,
        PowerOnHoursPOH = 0x09,
        SpinRetryCount = 0x0A,
        CalibrationRetryCount = 0x0B,
        PowerCycleCount = 0x0C,
        SoftReadErrorRate = 0x0D,
        SATADownshiftErrorCount = 0xB7,
        EndtoEnderror = 0xB8,
        HeadStability = 0xB9,
        InducedOpVibrationDetection = 0xBA,
        ReportedUncorrectableErrors = 0xBB,
        CommandTimeout = 0xBC,
        HighFlyWrites = 0xBD,
        AirflowTemperatureWDC = 0xBE,
        TemperatureDifferencefrom100 = 0xBE,
        GSenseErrorRate = 0xBF,
        PoweroffRetractCount = 0xC0,
        LoadCycleCount = 0xC1,
        Temperature = 0xC2,
        HardwareECCRecovered = 0xC3,
        ReallocationEventCount = 0xC4,
        CurrentPendingSectorCount = 0xC5,
        UncorrectableSectorCount = 0xC6,
        UltraDMACRCErrorCount = 0xC7,
        MultiZoneErrorRate = 0xC8,
        WriteErrorRateFujitsu = 0xC8,
        OffTrackSoftReadErrorRate = 0xC9,
        DataAddressMarkerrors = 0xCA,
        RunOutCancel = 0xCB,
        SoftECCCorrection = 0xCC,
        ThermalAsperityRateTAR = 0xCD,
        FlyingHeight = 0xCE,
        SpinHighCurrent = 0xCF,
        SpinBuzz = 0xD0,
        OfflineSeekPerformance = 0xD1,
        VibrationDuringWrite = 0xD3,
        ShockDuringWrite = 0xD4,
        DiskShift = 0xDC,
        GSenseErrorRateAlt = 0xDD,
        LoadedHours = 0xDE,
        LoadUnloadRetryCount = 0xDF,
        LoadFriction = 0xE0,
        LoadUnloadCycleCount = 0xE1,
        LoadInTime = 0xE2,
        TorqueAmplificationCount = 0xE3,
        PowerOffRetractCycle = 0xE4,
        GMRHeadAmplitude = 0xE6,
        DriveTemperature = 0xE7,
        HeadFlyingHours = 0xF0,
        TransferErrorRateFujitsu = 0xF0,
        TotalLBAsWritten = 0xF1,
        TotalLBAsRead = 0xF2,
        ReadErrorRetryRate = 0xFA,
        FreeFallProtection = 0xFE,
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct SmartAttribute
    {
        public SmartAttributeType AttributeType;
        public ushort Flags;
        public byte Value;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 8)]
        public byte[] VendorData;

        public bool Advisory
        {
            get
            {
                return (Flags & 0x1) == 0x0; // Bit 0 unset?
            }
        }
        public bool FailureImminent
        {
            get
            {
                return (Flags & 0x1) == 0x1; // Bit 0 set?
            }
        }
        public bool OnlineDataCollection
        {
            get
            {
                return (Flags & 0x2) == 0x2; // Bit 0 set?
            }
        }

    }
}
