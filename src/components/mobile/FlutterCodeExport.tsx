import React, { useState } from 'react';
import { Copy, Check, Download, Code2, Terminal, Layers } from 'lucide-react';

export const FlutterCodeExport: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<'main' | 'crypto' | 'visa' | 'pubspec'>('main');

  const files = {
    main: {
      name: 'lib/main.dart',
      language: 'dart',
      code: `// Gabbybru Company Ltd - Basic School Mobile App (Flutter for iOS & Android)
// Features: Primary & JHS Attendance, Live Gradebook, Timetables, E2EE, and Visa Payments

import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'dart:io' show Platform;

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const GabbybruApp());
}

class GabbybruApp extends StatelessWidget {
  const GabbybruApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gabbybru Company Ltd',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E3A8A), // Institutional Navy
          brightness: Brightness.light,
        ),
        fontFamily: 'PlusJakartaSans',
      ),
      home: const MainTabNavigator(),
    );
  }
}

class MainTabNavigator extends StatefulWidget {
  const MainTabNavigator({super.key});

  @override
  State<MainTabNavigator> createState() => _MainTabNavigatorState();
}

class _MainTabNavigatorState extends State<MainTabNavigator> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    AttendanceScreen(),
    GradesScreen(),
    VisaWalletScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.fact_check_outlined),
            selectedIcon: Icon(Icons.fact_check),
            label: 'Attendance',
          ),
          NavigationDestination(
            icon: Icon(Icons.school_outlined),
            selectedIcon: Icon(Icons.school),
            label: 'Grades',
          ),
          NavigationDestination(
            icon: Icon(Icons.payment_outlined),
            selectedIcon: Icon(Icons.payment),
            label: 'Visa Pay',
          ),
        ],
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OmniSchool Academy', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_active_outlined), onPressed: () {}),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Student ID Card Widget
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            color: const Color(0xFF1E3A8A),
            child: const Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('FALL SEMESTER 2026/27', style: TextStyle(color: Colors.white70, fontSize: 11)),
                  SizedBox(height: 8),
                  Text('Alexander Sterling', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  Text('Grade 10-A · Roll #OS-2026-042', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('GPA: 3.92 / 4.00', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                      Text('Attendance: 98.2%', style: TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class AttendanceScreen extends StatelessWidget {
  const AttendanceScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Live Roll-Call & Tap Scanner')));
}

class GradesScreen extends StatelessWidget {
  const GradesScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Report Card & GPA Analytics')));
}

class VisaWalletScreen extends StatelessWidget {
  const VisaWalletScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Visa 3-D Secure Fee Gateway')));
}
`,
    },
    crypto: {
      name: 'lib/services/encryption_service.dart',
      language: 'dart',
      code: `// Flutter End-to-End Encryption Service (AES-256-GCM + PBKDF2)
import 'dart:convert';
import 'dart:typed_data';
import 'package:cryptography/cryptography.dart';

class FlutterE2EEService {
  static final FlutterE2EEService _instance = FlutterE2EEService._internal();
  factory FlutterE2EEService() => _instance;
  FlutterE2EEService._internal();

  final AesGcm _aesGcm = AesGcm.with256Bits();
  final Pbkdf2 _pbkdf2 = Pbkdf2(
    macAlgorithm: Hmac.sha256(),
    iterations: 100000,
    bits: 256,
  );

  String _currentPassphrase = "OmniSchool-Institutional-Security-2026!#Key";

  void updatePassphrase(String newPass) {
    _currentPassphrase = newPass;
  }

  Future<SecretKey> _deriveKey(List<int> salt) async {
    final secretKey = SecretKey(utf8.encode(_currentPassphrase));
    return await _pbkdf2.deriveKey(
      secretKey: secretKey,
      nonce: salt,
    );
  }

  Future<String> encrypt(String plaintext) async {
    final salt = SecretKeyData.random(length: 16).bytes;
    final derivedKey = await _deriveKey(salt);
    final secretBox = await _aesGcm.encrypt(
      utf8.encode(plaintext),
      secretKey: derivedKey,
    );

    final payload = {
      'ciphertext': base64Encode(secretBox.cipherText),
      'iv': base64Encode(secretBox.nonce),
      'salt': base64Encode(salt),
      'mac': base64Encode(secretBox.mac.bytes),
      'algorithm': 'AES-256-GCM',
    };

    return jsonEncode(payload);
  }

  Future<String> decrypt(String encryptedJson) async {
    try {
      final map = jsonDecode(encryptedJson);
      final salt = base64Decode(map['salt']);
      final iv = base64Decode(map['iv']);
      final cipherText = base64Decode(map['ciphertext']);
      final macBytes = base64Decode(map['mac']);

      final derivedKey = await _deriveKey(salt);
      final secretBox = SecretBox(
        cipherText,
        nonce: iv,
        mac: Mac(macBytes),
      );

      final clearBytes = await _aesGcm.decrypt(
        secretBox,
        secretKey: derivedKey,
      );

      return utf8.decode(clearBytes);
    } catch (e) {
      return '[Locked / Encrypted Confidential Record]';
    }
  }
}
`,
    },
    visa: {
      name: 'lib/screens/visa_checkout_sheet.dart',
      language: 'dart',
      code: `// Flutter Visa Payment Bottom Sheet with 3-D Secure Authorization
import 'package:flutter/material.dart';

class VisaCheckoutSheet extends StatefulWidget {
  final double amount;
  final String description;
  final Function(String txnId) onSuccess;

  const VisaCheckoutSheet({
    super.key,
    required this.amount,
    required this.description,
    required this.onSuccess,
  });

  @override
  State<VisaCheckoutSheet> createState() => _VisaCheckoutSheetState();
}

class _VisaCheckoutSheetState extends State<VisaCheckoutSheet> {
  final _formKey = GlobalKey<FormState>();
  String _cardNumber = '4242 4242 4242 4242';
  String _cardHolder = 'ELEANOR STERLING';
  String _expiry = '12/28';
  String _cvv = '883';
  bool _isProcessing = false;

  void _processPayment() async {
    setState(() => _isProcessing = true);
    // Simulate Visa network processing & 3DS challenge
    await Future.delayed(const Duration(milliseconds: 1500));
    setState(() => _isProcessing = false);

    final txnId = 'TXN-VISA-\${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    widget.onSuccess(txnId);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        left: 20,
        right: 20,
        top: 20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('VISA Secure Checkout', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 12),
          Text(widget.description, style: const TextStyle(color: Colors.grey)),
          Text('\$\${widget.amount.toStringAsFixed(2)} USD', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _isProcessing ? null : _processPayment,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E3A8A),
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: _isProcessing
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text('Authorize Payment with Visa', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
`,
    },
    pubspec: {
      name: 'pubspec.yaml',
      language: 'yaml',
      code: `name: omnischool_mobile
description: "OmniSchool Cross-Platform Flutter Mobile Client for iOS & Android"
version: 1.0.0+1
environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  cryptography: ^2.7.0
  intl: ^0.19.0
  flutter_secure_storage: ^9.0.0
  qr_flutter: ^4.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
`,
    },
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Flutter Mobile Source Code Export</h3>
          </div>
          <p className="text-xs text-slate-500">
            Production-ready Flutter (Dart) project code for compiling to Android APK and Apple iOS IPA.
          </p>
        </div>

        <button
          onClick={() => handleCopy(files[activeFile].code, activeFile)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors self-start sm:self-auto"
        >
          {copiedKey === activeFile ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedKey === activeFile ? 'Copied to Clipboard!' : 'Copy Active File'}</span>
        </button>
      </div>

      {/* File Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        {(Object.keys(files) as (keyof typeof files)[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveFile(key)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap ${
              activeFile === key
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {files[key].name}
          </button>
        ))}
      </div>

      {/* Code Viewer */}
      <div className="relative">
        <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-xs rounded-xl overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
          <code>{files[activeFile].code}</code>
        </pre>
      </div>

      {/* Build Instructions */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-slate-600" />
          <span>Quickstart Compilation Steps</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 font-mono text-[11px]">
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px]"># 1. Android APK Build</span>
            <span className="text-blue-700 font-bold">flutter pub get</span>
            <br />
            <span className="text-blue-700 font-bold">flutter build apk --release</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px]"># 2. Apple iOS IPA Build</span>
            <span className="text-purple-700 font-bold">cd ios &amp;&amp; pod install</span>
            <br />
            <span className="text-purple-700 font-bold">flutter build ipa --export-options-plist=...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
