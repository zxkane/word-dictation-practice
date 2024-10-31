"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Typography, Box, Card, CardHeader, CardContent, CardMedia, List, ListItem, ListItemText, ListItemAvatar, Avatar } from "@mui/material";
import { useContext } from 'react';
import { DrawerContext } from '@/components/DashboardLayout';

export default function HomePage() {
  const { toggleDrawer } = useContext(DrawerContext);

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Welcome to English Dictation Practice
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <CardContent sx={{ flex: '1 0 auto' }}>
                <Typography component="div" variant="h5">
                  关于本站点
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  家里小朋友在家分享了在学校信息课上练习键盘打字。我们想到了一个有趣的主意 - 为什么不把打字练习变成一个有趣的英语听写游戏呢？这样不仅可以提高打字速度，还能增强英语听和拼写能力。一举多得，让学习变得更有趣！于是这个应用就诞生了。
                </Typography>
              </CardContent>
            </Box>
            <CardMedia
              component="img"
              sx={{ 
                width: { xs: '100%', md: '40%' },
                height: { xs: 200, md: 300 },
                objectFit: 'cover'
              }}
              image="/about-all.jpeg"
              alt="Three Boys!!!"
            />
          </Card>

          <Card>
            <CardHeader title="如何使用" />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>1</Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography component="span">
                        从菜单中选择
                        <Typography
                          component="span"
                          sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                          onClick={toggleDrawer}
                        >
                          练习
                        </Typography>
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>2</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="选择教材和单元（可选1个或多个）" />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>3</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="开始听写练习" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
