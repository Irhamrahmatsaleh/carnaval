import { thread } from "@/libs/type";
import { Box, Link as ChakraLink, Flex, IconButton, Image, LinkBox, Menu, MenuButton, MenuItem, MenuList, Modal, ModalCloseButton, ModalContent, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useToast } from '@chakra-ui/react';
import { useQuery } from "@tanstack/react-query";
import Axios from 'axios';
import { SetStateAction, useEffect, useState } from "react";
import { BiMessage, BiSolidMessage } from "react-icons/bi";
import { BsHeart, BsHeartFill, BsThreeDots, BsTrash } from "react-icons/bs";
import { Link } from "react-router-dom";
import { api } from "../libs/api";
import f from './function';
import { deleteThread } from "./threads";

export async function fetchThreadsProfile() {
    try {
        const token = localStorage.getItem('token');
        const response = await Axios({
            method: "get",
            url: `${api}/threadProfile`,
            headers: {
                "Content-Type": "multipart/form-data",
                'Authorization': `Bearer ${token}`
            },
        })
        return response.data;
    } catch (error) {
        return error;
    }
}

export default function Threads() {
    const { data: threadsProfile, refetch } = useQuery<thread[]>({
        queryKey: ["threadsProfile"],
        queryFn: fetchThreadsProfile,
    });
    const toast = useToast();
    const [, setThread] = useState<thread[]>([]);
    const [isLiked, setIsLiked] = useState<boolean[]>([]);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        async function fetchThreads() {
            try {
                const token = localStorage.getItem('token');
                const response = await Axios({
                    method: "get",
                    url: `${api}/threadProfile`,
                    headers: {
                        "Content-Type": "multipart/form-data",
                        'Authorization': `Bearer ${token}`
                    },
                })
                setThread(response.data);
                setIsLiked(response.data.map((data: any) => {
                    return data["isliked"];
                }))
            } catch (error) {

                return error;
            }
        }
        fetchThreads();
    }, [])


    const handleLike = async (id: number, index: number) => {
        likeHandle(index, true);
        try {
            const token = localStorage.getItem('token');
            await Axios({
                method: "get",
                url: `${api}/like${id}`,
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': `Bearer ${token}`
                },
            });
        } catch (error) {
            console.error('Error liking the item', error);
            likeHandle(index, false);
        }
    };

    const handleUnlike = async (id: number, index: number) => {
        likeHandle(index, false);
        try {
            const token = localStorage.getItem('token');
            await Axios({
                method: "get",
                url: `${api}/unlike${id}`,
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': `Bearer ${token}`
                },
            });
        } catch (error) {
            console.error('Error unliking the item', error);
            likeHandle(index, true);
        }
    };

    const handleDelete = async (idThread: number) => {
        try {
            await deleteThread(idThread);
            toast({
                title: "Delete thread success!",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error unliking the item', error);
            toast({
                title: "Delete thread failed!",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
        refetch();
    };

    const likeHandle = (index: number, con: boolean) => {
        console.log(isLiked);
        const newLiked = [...isLiked];
        newLiked[index] = con;
        setIsLiked(newLiked);
    }

    useEffect(() => {
        if (isLiked) refetch();
    }, [isLiked])

    const data = threadsProfile?.map((item, index) => {
        if (item.users == null) {
            return;
        }
        return (
            <Flex alignItems={'start'} justifyContent={'space-between'} color={'white'} borderBottom={'1px solid rgb(110, 110, 110, 0.333)'} marginTop={'1rem'} key={index}>
                <Flex alignItems={'start'}>
                    <Link to="/Profile">
                        <Box as='a' href={"/profile"} className="picture" >
                            {f.imageCircle(item.users.photo_profile, '32px')}
                        </Box>
                    </Link>
                    <Flex marginX={'1rem'} flexDirection={'column'} justifyContent={'start'} marginBottom={'0.5rem'}>
                        <Flex
                            fontSize={'small'}
                            color={'rgb(199, 199, 199)'}
                            marginEnd={'0.5rem'}
                            marginBottom={'0.33rem'}
                            gap={'0.33rem'} >
                            <Text fontWeight={'bold'} color={'white'}>
                                {item.users.full_name && item.users.full_name}
                            </Text>
                            <Text>
                                {item.users.username && item.users.username}
                            </Text>
                            <Text>
                                {f.dateDifferences(item.update_at)}
                            </Text>
                        </Flex>
                        <Box marginBottom={'0.5rem'}>
                            <Text marginBottom={'0.33rem'}>
                                {item.content}
                            </Text>
                            {item.image ? (f.imageMessage(item.image)) : <></>}
                        </Box>
                        <Flex gap={'0.33rem'} marginBottom={'0.5rem'} alignItems={'center'}>
                            {isLiked[index] ?
                                <ChakraLink onClick={() => handleUnlike(item.id, index)}> <BsHeartFill /> </ChakraLink> : <ChakraLink onClick={() => handleLike(item.id, index)}> <BsHeart /> </ChakraLink>}
                            <Text marginEnd={'0.5rem'} color={'rgb(160, 160, 160)'} fontSize={'small'}>{item.likes.length}</Text>
                            <LinkBox>
                                <Link to={`/threads/${item.id}`}><Box>{item.isReplied ? <BiSolidMessage /> : <BiMessage />}</Box></Link>
                            </LinkBox>
                            <Text marginEnd={'0.5rem'} color={'rgb(160, 160, 160)'} fontSize={'small'}>{item.number_of_replies} Replies</Text>
                        </Flex>
                    </Flex>
                </Flex>
                <Box>
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label='Options'
                            icon={<BsThreeDots />}
                            colorScheme="black"
                            variant=''
                        />
                        <MenuList color={'black'}>
                            <MenuItem onClick={() => handleDelete(item.id)} icon={<BsTrash />}>
                                Delete Threads
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
            </Flex>
        )
    })

    // Fungsi untuk membuka modal dengan gambar yang dipilih
    const openModal = (imageSrc: SetStateAction<string>) => {
        setSelectedImage(imageSrc);
        setIsOpen(true);
    };

    // Fungsi untuk menutup modal
    const closeModal = () => {
        setIsOpen(false);
        setSelectedImage('');
    };

    const tabImage = threadsProfile?.map((item, index) => {
        // Pastikan gambar ada dan valid
        if (item.image && item.image !== 'path/to/default/logo.png') {
            return (
                <Box key={index} onClick={() => openModal(item.image)} cursor="pointer">
                    <Image
                        src={item.image}
                        key={index}
                        objectFit="cover"
                        w="100%"
                        h="100%"
                        borderRadius="3px"
                    />
                </Box>
            );
        }
        return null; // Jika gambar tidak valid, kembalikan null
    });

    return (
        <Box>
            <Tabs isFitted colorScheme="green">
                <TabList mb='1rem' color={'white'}>
                    <Tab>All Post</Tab>
                    <Tab>Media</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        {data}
                    </TabPanel>
                    <TabPanel>
                        <Box
                            display="grid"
                            gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))"
                            gap={1}
                        >
                            {tabImage}
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>
            {/* Modal untuk menampilkan gambar besar */}
            <Modal isOpen={isOpen} onClose={closeModal} size="full">
                <ModalOverlay />
                <ModalContent
                    bg="transparent"
                    maxWidth="100%"
                    maxHeight="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                >
                    <ModalCloseButton
                        position="absolute"
                        top="10px"
                        left="10px"
                        bg="transparent"
                        color="white"
                        fontSize="2xl"
                        _hover={{ bg: 'transparent', color: 'gray.400' }}
                    />
                    <Image
                        src={selectedImage}
                        objectFit="contain"
                        maxWidth="90%"
                        maxHeight="90%"
                    />
                </ModalContent>
            </Modal>
        </Box>
    );
}
