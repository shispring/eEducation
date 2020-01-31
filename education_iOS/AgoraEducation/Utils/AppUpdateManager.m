//
//  AppUpdateManager.m
//  AgoraEducation
//
//  Created by SRS on 2020/1/31.
//  Copyright © 2020 yangmoumou. All rights reserved.
//

#import "AppUpdateManager.h"
#import "AlertViewUtil.h"
#import "HttpManager.h"
#import "AppVersionModel.h"

#define ITUNES_URL @"https://itunes.apple.com/cn/app/id1496783878"

@interface AppUpdateManager()<UIApplicationDelegate>

@end

static AppUpdateManager *manager = nil;

@implementation AppUpdateManager

+ (instancetype)shareManager{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        manager = [[self alloc] init];
    });
    return manager;
}

- (instancetype)init {
    if(self = [super init]){
        [NSNotificationCenter.defaultCenter addObserver:self selector:@selector(applicationWillEnterForeground) name:UIApplicationWillEnterForegroundNotification object:nil];
    }
    return self;
}

+ (void)checkAppUpdate {
    
    NSInteger deviceType = 3;
    if (UIUserInterfaceIdiomPhone == [UIDevice currentDevice].userInterfaceIdiom) {
        deviceType = 1;
    } else if(UIUserInterfaceIdiomPad == [UIDevice currentDevice].userInterfaceIdiom) {
        deviceType = 2;
    }
    
    NSDictionary *infoDictionary = [[NSBundle mainBundle] infoDictionary];
    NSString *app_Version = [infoDictionary objectForKey:@"CFBundleShortVersionString"];
    
    NSDictionary *params = @{
        @"appCode" : @"edu-demo",
        @"osType" : @(1),// 1.ios 2.android
        @"terminalType" : @(deviceType),//1.phone 2.pad
        @"appVersion" : app_Version
    };
    [HttpManager get:HTTP_GET_APP_VERSION params:params headers:nil success:^(id responseObj) {
        
        AppVersionModel *model = [AppVersionModel yy_modelWithDictionary:responseObj];
        if(model.code == 0){
            if(model.data.reviewing == 0){
                if(model.data.forcedUpgrade == 2) {
                    [AppUpdateManager.shareManager showAppUpdateAlertView:NO];
                } else if(model.data.forcedUpgrade == 3) {
                    [AppUpdateManager.shareManager showAppUpdateAlertView:YES];
                }
            }
        }
    } failure:^(NSError *error) {

    }];
}

- (void)showAppUpdateAlertView:(BOOL)force {
    
    UIWindow *window = UIApplication.sharedApplication.windows.firstObject;
    UINavigationController *nvc = (UINavigationController*)window.rootViewController;
    if(nvc != nil){
        UIViewController *showController = nvc;
        if(nvc.visibleViewController != nil){
            showController = nvc.visibleViewController;
        }
        
        NSURL *url = [NSURL URLWithString:ITUNES_URL];
        
        if(force){
            [AlertViewUtil showAlertWithController:showController title:@"The version has been updated. Please download the new version" message:nil cancelText:nil sureText:@"OK" cancelHandler:nil sureHandler:^(UIAlertAction * _Nullable action) {

                if(@available(iOS 10.0, *)) {
                    [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
                } else {
                    [[UIApplication sharedApplication] openURL:url];
                }
            }];
        } else {
            [AlertViewUtil showAlertWithController:showController title:@"The version has been updated. Please download the new version" message:nil cancelText:@"Cancel" sureText:@"OK" cancelHandler:nil sureHandler:^(UIAlertAction * _Nullable action) {

                if(@available(iOS 10.0, *)) {
                    [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
                } else {
                    [[UIApplication sharedApplication] openURL:url];
                }
            }];
        }
    }
}

- (void)applicationWillEnterForeground {
    [AppUpdateManager checkAppUpdate];
}

- (void)dealloc {
    [NSNotificationCenter.defaultCenter removeObserver:self];
}

@end
