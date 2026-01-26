## UI
cd ui
npm run dev

## manager
source .venv/bin/activate
python3 -m server.main（python3 -m server.main --log-level DEBUG）

##　pi
ping shotapi.local
ssh tsunogayashouta@192.168.207.147
cd ~/aframe-manager-demo2/
source ~/venv-sora/bin/activate
source /opt/ros/jazzy/setup.bash
export ROS_DOMAIN_ID=10
printenv | grep ROS
python3 rpi/state_recv.py --publish-cmd-vel --cmd-vel-topic /cmd_vel --log-level DEBUG（TIMELINEを使って遅延を見たい時：python3 -m rpi.state_recv --log-level INFO 2>&1 | grep TIMELINE）

## Jetson
dns-sd -G v4 orin02.local
ssh uclab@192.168.207.167
source /opt/ros/humble/setup.bash
source ~/smagv_ws/install/setup.bash
export ROS_DOMAIN_ID=10
ros2 launch smagv_common smagv_bringup.launch.xml

## /cmd_vel確認用
ros2 topic info /cmd_vel
ros2 topic echo /cmd_vel
ros2 topic hz /cmd_vel
