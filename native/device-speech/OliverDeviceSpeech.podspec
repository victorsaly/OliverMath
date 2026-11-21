Pod::Spec.new do |s|
  s.name = 'OliverDeviceSpeech'
  s.version = '0.1.0'
  s.summary = 'On-device speech recognition and synthesis for Oliver Math.'
  s.license = 'MIT'
  s.homepage = 'https://github.com/victorsaly/OliverMath'
  s.author = 'Oliver Math'
  s.source = { :git => 'https://github.com/victorsaly/OliverMath.git', :tag => s.version.to_s }
  s.source_files = 'ios/Sources/**/*.{swift,h,m}'
  s.ios.deployment_target = '15.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.9'
end
