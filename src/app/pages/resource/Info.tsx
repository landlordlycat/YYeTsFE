import * as React from "react";
import { Box, Button, createStyles, Grid, Link, makeStyles, Theme, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import {
  Explore as ExploreIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as UnFavoriteIcon,
  Share as ShareIcon,
  MovieFilter as MovieFilterIcon,
  Visibility as VisibilityIcon,
} from "@material-ui/icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";

import { ResourceInfo, patchLike, postMetrics, DoubanInfo } from "API";
import { useAuth, useDomeSize, useLoginBack } from "hooks";
import { DoubanRateIcon } from "Icon";
import { noop } from "utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      paddingTop: theme.spacing(4),
      [theme.breakpoints.up("sm")]: {
        paddingTop: theme.spacing(6),
      },
    },
    title: {
      marginRight: theme.spacing(1),
      [theme.breakpoints.up("sm")]: {
        marginRight: theme.spacing(4),
      },
    },
    enTitle: {
      alignSelf: "flex-end",
    },
    alias: {
      marginTop: theme.spacing(1),
    },
    attribute: {
      marginTop: theme.spacing(3),
    },
    label: {
      marginLeft: theme.spacing(1),
    },
    doubanContainer: {
      display: "flex",
      marginTop: 16,
    },
    post: {
      borderRadius: 4,
      boxShadow: theme.shadows[4],
      width: "30vw",
      maxWidth: 170,
      marginRight: 12,
      paddingTop: "150%",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
    },
    info: {
      flex: 1,
      overflow: "hidden",
      paddingBottom: 4,
    },
    introduction: {
      position: "relative",
      transition: theme.transitions.create("max-height", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      overflow: "hidden",
      marginBottom: 16,
    },
    button: {
      position: "absolute",
      top: 39,
      right: 2,
      backgroundColor: theme.palette.background.default,
    },
  })
);

interface InfoPropTypes {
  loading: boolean;
  resourceInfo: ResourceInfo;
  url: string;
  isLike: boolean;
  setIsLike: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  doubanInfo: DoubanInfo | null;
}

export function Info(props: InfoPropTypes) {
  const { loading, resourceInfo, url, isLike, setIsLike, id, doubanInfo } = props;
  const MAX_HEIGHT = 60;

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const history = useHistory();

  const login = useLoginBack();
  const { username } = useAuth();

  const [likeLoading, setLikeLoading] = React.useState<boolean>(false);

  const [showMore, setShowMore] = React.useState<boolean>(false);
  const [rect, ref] = useDomeSize();

  const handleClick = () => {
    setShowMore((pre) => !pre);
  };

  const handleClickFavorite = () => {
    if (!username) {
      enqueueSnackbar("请先登录", {
        variant: "warning",
        action: (key) => (
          <Button
            onClick={() => {
              closeSnackbar(key);
              history.push(login);
            }}
            color="inherit"
          >
            去登录
          </Button>
        ),
      });
      return;
    }

    if (!isLike) {
      gtag("event", "add_to_favorite", { resource_id: id, form: "resource" });
      postMetrics("favorite").catch(noop);
    } else {
      gtag("event", "remove_from_favorite", { resource_id: id, form: "resource" });
      postMetrics("unFavorite").catch(noop);
    }

    setLikeLoading(true);
    patchLike({ resource_id: id })
      .then((res) => {
        setLikeLoading(false);
        setIsLike((pre) => !pre);

        enqueueSnackbar(res.data, { variant: "success" });
      })
      .catch((error) => {
        setLikeLoading(false);
        enqueueSnackbar(error.message, { variant: "error" });
      });
  };

  const classes = useStyles();
  const getDoubanPoster = () => {
    const webpcloud = "https://3297e64.webp.ee";
    return `${webpcloud}/api/douban?resource_id=${id}&type=image`;
  };

  return (
    <div>
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        <Typography component="h1" variant="h4" className={classes.title}>
          {loading ? <Skeleton variant="rect" width={200} /> : resourceInfo.cnname}
        </Typography>

        <Typography className={classes.enTitle}>
          {loading ? <Skeleton variant="rect" width={100} /> : resourceInfo.enname}
        </Typography>
      </Box>
      <Typography className={classes.alias} variant="body2">
        {loading ? <Skeleton variant="rect" width="100%" /> : resourceInfo.aliasname}
      </Typography>
      <Grid container className={classes.attribute}>
        <Grid item xs={4} sm={3} md={2}>
          <Box display="flex" alignItems="center">
            {loading ? <Skeleton variant="circle" width={24} height={24} /> : <MovieFilterIcon />}
            <Typography className={classes.label}>
              {loading ? <Skeleton variant="rect" width={50} height={24} /> : resourceInfo.channel_cn}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4} sm={3} md={2}>
          <Box display="flex" alignItems="center">
            {loading ? <Skeleton variant="circle" width={24} height={24} /> : <ExploreIcon />}
            <Typography className={classes.label}>
              {loading ? <Skeleton variant="rect" width={50} height={24} /> : resourceInfo.area}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4} sm={3} md={2}>
          <Box display="flex" alignItems="center">
            {loading ? <Skeleton variant="circle" width={24} height={24} /> : <VisibilityIcon />}
            <Typography className={classes.label}>
              {loading ? <Skeleton variant="rect" width={50} height={24} /> : resourceInfo.views}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {doubanInfo && !loading ? (
        <div className={classes.doubanContainer}>
          {/* 海报 */}
          <Link href={doubanInfo.doubanLink} target="_blank">
            <div
              style={{
                backgroundImage: `url(${getDoubanPoster()})`,
              }}
              className={classes.post}
            />
          </Link>

          {/* 详细信息 */}
          <div className={classes.info}>
            <Typography variant="body2" noWrap>
              {doubanInfo.year} | {doubanInfo.genre?.join("、")}
            </Typography>
            <Typography variant="body2" noWrap style={{ marginBottom: 16 }}>
              {doubanInfo.episodeCount && ` 集数: ${doubanInfo.episodeCount}`} 时长: {doubanInfo.episodeDuration}
            </Typography>

            {/* 简介 */}
            <div
              className={classes.introduction}
              style={{ maxHeight: showMore ? `${rect.height + 21}px` : MAX_HEIGHT }}
            >
              <Typography
                variant="body2"
                ref={ref}
                style={{ wordBreak: "break-all", whiteSpace: "pre-wrap" }}
                component="div"
              >
                <DoubanRateIcon rate={Number(doubanInfo.rating) || 0} style={{ float: "left", marginRight: 8 }} />
                {doubanInfo.introduction}
                {rect.height > MAX_HEIGHT && (
                  <div
                    className={classes.button}
                    style={{ display: showMore ? "inline-block" : "block", position: showMore ? "static" : "absolute" }}
                  >
                    <Button
                      onClick={handleClick}
                      color="primary"
                      style={{ padding: "0 4px", minWidth: "auto", lineHeight: "1.43", fontWeight: "bold" }}
                      disableRipple
                    >
                      {showMore ? "收起" : "展开"}
                    </Button>
                  </div>
                )}
              </Typography>
            </div>

            {/* 人员信息 */}
            {doubanInfo.directors?.length > 0 && (
              <Typography variant="body2" noWrap title={doubanInfo.directors.join("、")}>
                <Typography component="span" style={{ fontWeight: "bold" }} variant="body2">
                  导演:&nbsp;
                </Typography>
                {doubanInfo.directors.join("、")}
              </Typography>
            )}

            {doubanInfo.writers?.length > 0 && (
              <Typography variant="body2" noWrap title={doubanInfo.writers?.join("、")}>
                <Typography component="span" style={{ fontWeight: "bold" }} variant="body2">
                  编剧:&nbsp;
                </Typography>
                {doubanInfo.writers?.join("、")}
              </Typography>
            )}

            {doubanInfo.actors?.length > 0 && (
              <Typography variant="body2" noWrap title={doubanInfo.actors.join("、")}>
                <Typography component="span" style={{ fontWeight: "bold" }} variant="body2">
                  演员:&nbsp;
                </Typography>
                {doubanInfo.actors.join("、")}
              </Typography>
            )}

            <Typography variant="caption" color="textSecondary">
              以上信息根据关键字检索，仅供参考
            </Typography>

            {/* 工具栏 */}
            <div style={{ marginTop: 16 }}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={isLike ? <UnFavoriteIcon /> : <FavoriteIcon />}
                onClick={handleClickFavorite}
                disabled={likeLoading}
              >
                {isLike ? "取消收藏" : "收藏资源"}
              </Button>

              <CopyToClipboard
                text={`我发现了一个好资源「${resourceInfo.cnname}」${url} 快来看看吧`}
                onCopy={() => {
                  enqueueSnackbar("页面地址复制成功，快去分享给小伙伴吧", { variant: "success" });
                  gtag("event", "share", { resource_id: id, form: "resource" });
                  postMetrics("share").catch(noop);
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<ShareIcon />}
                  style={{ marginLeft: 8 }}
                >
                  分享页面
                </Button>
              </CopyToClipboard>

              {/* TODO: 反馈豆瓣错误信息 */}
            </div>
          </div>
        </div>
      ) : (
        <Grid container className={classes.attribute}>
          <Grid item xs={4} sm={3} md={2}>
            {loading ? (
              <Skeleton variant="rect" width={100} height={30} />
            ) : (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={isLike ? <UnFavoriteIcon /> : <FavoriteIcon />}
                onClick={handleClickFavorite}
                disabled={likeLoading}
              >
                {isLike ? "取消收藏" : "收藏资源"}
              </Button>
            )}
          </Grid>
          <Grid item xs={4} sm={3} md={2}>
            {loading ? (
              <Skeleton variant="rect" width={100} height={30} />
            ) : (
              <CopyToClipboard
                text={url}
                onCopy={() => {
                  enqueueSnackbar("页面地址复制成功，快去分享给小伙伴吧", { variant: "success" });
                  gtag("event", "share", { resource_id: id, form: "resource" });
                  postMetrics("share").catch(noop);
                }}
              >
                <Button variant="contained" color="primary" size="small" startIcon={<ShareIcon />}>
                  分享页面
                </Button>
              </CopyToClipboard>
            )}
          </Grid>
        </Grid>
      )}
    </div>
  );
}
