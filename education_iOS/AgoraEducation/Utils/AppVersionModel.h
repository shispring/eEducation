//
//  AppVersionModel.h
//  AgoraEducation
//
//  Created by SRS on 2020/1/31.
//  Copyright © 2020 yangmoumou. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface AppVersionInfoModel : NSObject

@property (nonatomic, strong) NSString *appCode;
@property (nonatomic, assign) NSInteger osType;
@property (nonatomic, assign) NSInteger terminalType;
@property (nonatomic, strong) NSString *appVersion;
@property (nonatomic, strong) NSString *latestVersion;
@property (nonatomic, strong) NSString *appPackage;
@property (nonatomic, strong) NSString *upgradeDescription;
@property (nonatomic, assign) NSInteger forcedUpgrade;//1 no update 2update 3force update
@property (nonatomic, strong) NSString *upgradeUrl;
@property (nonatomic, assign) NSInteger reviewing;
@property (nonatomic, assign) NSInteger remindTimes;
@end

@interface AppVersionModel : NSObject

@property (nonatomic, assign) NSInteger code;
@property (nonatomic, strong) NSString *msg;
@property (nonatomic, strong) AppVersionInfoModel *data;

@end

NS_ASSUME_NONNULL_END
